import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db, isConfigured } from '../../shared/firebase.js';
import { createDoseLog, getDemoStore, setDemoStore } from '../../shared/dataService.js';

/**
 * Standard default timings based on times per day if timings array is empty or missing.
 */
const DEFAULT_TIMINGS = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '14:00', '20:00'],
  4: ['08:00', '12:00', '16:00', '20:00'],
};

/**
 * Utility to calculate YYYY-MM-DD for a given day offset from base date
 * without timezone drift.
 */
function getOffsetDateString(baseDateStr, dayOffset) {
  let base;
  if (baseDateStr && typeof baseDateStr === 'string' && baseDateStr.includes('-')) {
    const [y, m, d] = baseDateStr.split('-').map(Number);
    base = new Date(y, m - 1, d);
  } else {
    base = new Date();
  }
  base.setDate(base.getDate() + dayOffset);
  const yyyy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, '0');
  const dd = String(base.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Given a saved prescription, generates doseLogs documents for every dose
 * (each timing, each day of the duration) with status "pending".
 *
 * Conforms strictly to DATA_MODEL.md:
 * - id: Document ID
 * - patientId: Reference to patients.id
 * - prescriptionId: Reference to prescriptions.id
 * - medicineName: Name of the medicine
 * - scheduledTime: Date & time (e.g. '2026-10-25 08:00')
 * - status: 'pending'
 *
 * @param {Object} prescription - The saved prescription object
 * @returns {Promise<{ success: boolean, count: number, doseLogs: Array }>}
 */
export async function createDoseSchedule(prescription) {
  if (!prescription) {
    throw new Error('createDoseSchedule: prescription object is required.');
  }

  const { id: prescriptionId, patientId, medicines = [], date: rxDate } = prescription;

  if (!prescriptionId) {
    throw new Error('createDoseSchedule: prescription must have a valid id.');
  }
  if (!patientId) {
    throw new Error('createDoseSchedule: prescription must have a valid patientId.');
  }

  const startDate = rxDate || new Date().toISOString().slice(0, 10);
  const generatedDoseLogs = [];

  medicines.forEach((medicine, mIdx) => {
    const durationDays = Math.max(1, Number(medicine.durationDays) || 3);
    const timesPerDay = Math.max(1, Number(medicine.timesPerDay) || 1);

    // Resolve timing slots: use medicine.timings if present, else fallback based on timesPerDay
    let timings = Array.isArray(medicine.timings) && medicine.timings.length > 0
      ? medicine.timings
      : DEFAULT_TIMINGS[timesPerDay] || ['08:00'];

    for (let day = 0; day < durationDays; day++) {
      const dateStr = getOffsetDateString(startDate, day);

      timings.forEach((timingSlot) => {
        const cleanTiming = timingSlot.trim();
        const timeKey = cleanTiming.replace(/[^0-9]/g, '');
        const doseLogId = `dose_${prescriptionId}_m${mIdx}_d${day}_t${timeKey}`;

        generatedDoseLogs.push({
          id: doseLogId,
          patientId,
          prescriptionId,
          medicineName: medicine.name || 'Prescribed Medicine',
          scheduledTime: `${dateStr} ${cleanTiming}`,
          status: 'pending',
          dose: medicine.dose || '1 dose',
          remarks: medicine.remarks || '',
          createdAt: new Date().toISOString(),
        });
      });
    }
  });

  if (generatedDoseLogs.length === 0) {
    return { success: true, count: 0, doseLogs: [] };
  }

  // 1. If live Firestore is configured, perform atomic batch write
  if (isConfigured && db) {
    try {
      const batchSize = 400; // Keep below Firestore's 500 limit
      for (let i = 0; i < generatedDoseLogs.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = generatedDoseLogs.slice(i, i + batchSize);
        chunk.forEach((dose) => {
          const docRef = doc(db, 'doseLogs', dose.id);
          batch.set(docRef, dose, { merge: true });
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn('Firestore batch write error in createDoseSchedule, falling back to local store:', err);
    }
  }

  // 2. Synchronize with local demo store so offline mode has full schedule immediately
  try {
    const store = getDemoStore();
    const existing = store.doseLogs || [];
    const newIds = new Set(generatedDoseLogs.map((d) => d.id));
    const merged = [
      ...existing.filter((d) => !newIds.has(d.id)),
      ...generatedDoseLogs,
    ];
    setDemoStore({ ...store, doseLogs: merged });
  } catch (e) {
    // Fallback single additions
    for (const dose of generatedDoseLogs) {
      await createDoseLog(dose);
    }
  }

  return {
    success: true,
    count: generatedDoseLogs.length,
    doseLogs: generatedDoseLogs,
  };
}

/**
 * Convenience helper to load a prescription by ID and create its dose schedule.
 * Useful for Person 1 or Person 3 if only the prescription ID is available.
 *
 * @param {string} prescriptionId
 * @returns {Promise<{ success: boolean, count: number, doseLogs: Array }>}
 */
export async function createDoseScheduleForPrescriptionId(prescriptionId) {
  if (!prescriptionId) return { success: false, count: 0, doseLogs: [] };

  if (isConfigured && db) {
    const q = query(collection(db, 'prescriptions'), where('id', '==', prescriptionId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const rx = { id: snap.docs[0].id, ...snap.docs[0].data() };
      return createDoseSchedule(rx);
    }
  }

  // Fallback to local demoStore
  const store = getDemoStore();
  const rx = (store.prescriptions || []).find((p) => p.id === prescriptionId);
  if (rx) {
    return createDoseSchedule(rx);
  }

  return { success: false, count: 0, doseLogs: [], message: `Prescription ${prescriptionId} not found.` };
}

/**
 * Background live listener that watches prescriptions for a patient (or all prescriptions).
 * Whenever a new prescription is saved that does not yet have corresponding doseLogs,
 * it automatically triggers createDoseSchedule.
 *
 * @param {string} [patientId] - Optional patientId filter
 * @param {Function} [onScheduleCreated] - Callback receiving the newly created schedule
 * @returns {Function} Unsubscribe function
 */
export function listenAndCreateDoseSchedules(patientId = null, onScheduleCreated = null) {
  // Track prescriptions we have already scheduled in this session to prevent duplicate work
  const processedRxIds = new Set();

  const handlePrescriptionList = async (prescriptions) => {
    for (const rx of prescriptions) {
      if (!rx || !rx.id || processedRxIds.has(rx.id)) continue;

      // Check if doseLogs already exist for this prescription
      let hasExistingDoseLogs = false;

      if (isConfigured && db) {
        try {
          const q = query(collection(db, 'doseLogs'), where('prescriptionId', '==', rx.id));
          const snap = await getDocs(q);
          hasExistingDoseLogs = !snap.empty;
        } catch (e) {
          // If query fails, fall back to checking local store
        }
      }

      if (!hasExistingDoseLogs) {
        const store = getDemoStore();
        hasExistingDoseLogs = (store.doseLogs || []).some((d) => d.prescriptionId === rx.id);
      }

      if (!hasExistingDoseLogs) {
        processedRxIds.add(rx.id);
        const result = await createDoseSchedule(rx);
        if (typeof onScheduleCreated === 'function') {
          onScheduleCreated(result);
        }
      } else {
        processedRxIds.add(rx.id);
      }
    }
  };

  if (isConfigured && db) {
    const colRef = collection(db, 'prescriptions');
    const q = patientId ? query(colRef, where('patientId', '==', patientId)) : colRef;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      handlePrescriptionList(items);
    });
    return unsubscribe;
  }

  // Local demo fallback: check current store prescriptions
  const store = getDemoStore();
  const list = patientId
    ? (store.prescriptions || []).filter((p) => p.patientId === patientId)
    : (store.prescriptions || []);
  handlePrescriptionList(list);

  return () => {};
}

export default createDoseSchedule;
