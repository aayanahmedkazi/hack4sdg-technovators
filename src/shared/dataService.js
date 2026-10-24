import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isConfigured } from './firebase';

/**
 * Local demo fallback store (used when Firebase is running in offline demo mode)
 */
const demoStore = {
  users: [
    { id: 'demo-patient-001', name: 'Aarav Sharma', role: 'patient', phone: '+91 98765 43210' },
    { id: 'demo-receptionist-001', name: 'Priya Patel', role: 'receptionist', phone: '+91 98765 43211' },
    { id: 'demo-doctor-001', name: 'Dr. Sameer Khan', role: 'doctor', phone: '+91 98765 43212' },
  ],
  hospitals: [
    { id: 'hospital-main', name: 'MediFlow City Clinic' },
  ],
  doctors: [
    { id: 'doc-001', userId: 'demo-doctor-001', hospitalId: 'hospital-main', name: 'Dr. Sameer Khan', speciality: 'General Physician' },
  ],
  patients: [
    { id: 'pat-001', userId: 'demo-patient-001', name: 'Aarav Sharma', age: 34, gender: 'Male', phone: '+91 98765 43210', address: 'B-104, Sunrise Apartments', hasSmartphone: true, registeredBy: 'demo-receptionist-001' },
    { id: 'pat-002', userId: null, name: 'Lakshmi Devi', age: 62, gender: 'Female', phone: '+91 98111 22334', address: 'Old Market Lane, Door 12', hasSmartphone: false, registeredBy: 'demo-receptionist-001' },
  ],
  queues: [
    { id: 'queue-doc001-today', doctorId: 'doc-001', date: new Date().toISOString().slice(0, 10), maxTokens: 40, currentNumber: 3, status: 'open', holdNote: '' },
  ],
  tokens: [
    { id: 'tok-001', doctorId: 'doc-001', patientId: 'pat-001', number: 1, date: new Date().toISOString().slice(0, 10), status: 'done', source: 'online', createdAt: new Date().toISOString() },
    { id: 'tok-002', doctorId: 'doc-001', patientId: 'pat-002', number: 2, date: new Date().toISOString().slice(0, 10), status: 'done', source: 'desk', createdAt: new Date().toISOString() },
    { id: 'tok-003', doctorId: 'doc-001', patientId: 'pat-001', number: 3, date: new Date().toISOString().slice(0, 10), status: 'serving', source: 'online', createdAt: new Date().toISOString() },
    { id: 'tok-004', doctorId: 'doc-001', patientId: 'pat-002', number: 4, date: new Date().toISOString().slice(0, 10), status: 'waiting', source: 'phone', createdAt: new Date().toISOString() },
  ],
  prescriptions: [
    {
      id: 'rx-001',
      patientId: 'pat-001',
      doctorId: 'doc-001',
      hospitalId: 'hospital-main',
      date: new Date().toISOString().slice(0, 10),
      medicines: [
        { name: 'Paracetamol 500mg', dose: '1 tablet', timesPerDay: 2, timings: ['08:00', '20:00'], durationDays: 3, remarks: 'Take after food' },
        { name: 'Cetirizine 10mg', dose: '1 tablet', timesPerDay: 1, timings: ['21:00'], durationDays: 5, remarks: 'Take before sleep' },
      ],
      tests: [
        { name: 'CBC Blood Count', date: new Date().toISOString().slice(0, 10) },
      ],
    },
  ],
  reports: [
    {
      id: 'rep-001',
      patientId: 'pat-001',
      doctorId: 'doc-001',
      hospitalId: 'hospital-main',
      date: new Date().toISOString().slice(0, 10),
      title: 'Initial Consultation Summary',
      notes: 'Mild fever and congestion. Vitals stable. Advised rest, hydration, and prescribed medicines.',
    },
  ],
  doseLogs: [
    { id: 'dose-001', patientId: 'pat-001', prescriptionId: 'rx-001', medicineName: 'Paracetamol 500mg', scheduledTime: '08:00', status: 'taken' },
    { id: 'dose-002', patientId: 'pat-001', prescriptionId: 'rx-001', medicineName: 'Paracetamol 500mg', scheduledTime: '20:00', status: 'pending' },
    { id: 'dose-003', patientId: 'pat-001', prescriptionId: 'rx-001', medicineName: 'Cetirizine 10mg', scheduledTime: '21:00', status: 'pending' },
  ],
  smsMessages: [
    { id: 'sms-001', patientId: 'pat-001', text: 'MediFlow Alert: Token #3 is now being served in Doctor Room 1.', createdAt: new Date().toISOString() },
  ],
};

/* =========================================================================
   1. USERS: id, name, role (patient | receptionist | doctor), phone
   ========================================================================= */

export async function getUser(userId) {
  if (isConfigured && db) {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }
  return demoStore.users.find((u) => u.id === userId) || null;
}

export async function createUser(userData) {
  if (isConfigured && db) {
    const docRef = doc(db, 'users', userData.id);
    await setDoc(docRef, userData, { merge: true });
    return userData;
  }
  demoStore.users = demoStore.users.filter((u) => u.id !== userData.id);
  demoStore.users.push(userData);
  return userData;
}

/* =========================================================================
   2. HOSPITALS: id, name
   ========================================================================= */

export async function getHospitals() {
  if (isConfigured && db) {
    const snap = await getDocs(collection(db, 'hospitals'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  return demoStore.hospitals;
}

export async function createHospital(hospitalData) {
  if (isConfigured && db) {
    const docRef = hospitalData.id ? doc(db, 'hospitals', hospitalData.id) : doc(collection(db, 'hospitals'));
    const toSave = { ...hospitalData, id: docRef.id };
    await setDoc(docRef, toSave, { merge: true });
    return toSave;
  }
  const id = hospitalData.id || `hospital-${Date.now()}`;
  const record = { ...hospitalData, id };
  demoStore.hospitals.push(record);
  return record;
}

/* =========================================================================
   3. DOCTORS: id, userId, hospitalId, name, speciality
   ========================================================================= */

export async function getDoctors(hospitalId = null) {
  if (isConfigured && db) {
    const colRef = collection(db, 'doctors');
    const q = hospitalId ? query(colRef, where('hospitalId', '==', hospitalId)) : colRef;
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  return hospitalId ? demoStore.doctors.filter((d) => d.hospitalId === hospitalId) : demoStore.doctors;
}

export async function getDoctor(doctorId) {
  if (isConfigured && db) {
    const docSnap = await getDoc(doc(db, 'doctors', doctorId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }
  return demoStore.doctors.find((d) => d.id === doctorId) || null;
}

export async function createDoctor(doctorData) {
  if (isConfigured && db) {
    const docRef = doctorData.id ? doc(db, 'doctors', doctorData.id) : doc(collection(db, 'doctors'));
    const toSave = { ...doctorData, id: docRef.id };
    await setDoc(docRef, toSave, { merge: true });
    return toSave;
  }
  const id = doctorData.id || `doc-${Date.now()}`;
  const record = { ...doctorData, id };
  demoStore.doctors.push(record);
  return record;
}

/* =========================================================================
   4. PATIENTS: id, userId, name, age, gender, phone, address, hasSmartphone, registeredBy
   ========================================================================= */

export async function getPatient(patientId) {
  if (isConfigured && db) {
    const docSnap = await getDoc(doc(db, 'patients', patientId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }
  return demoStore.patients.find((p) => p.id === patientId) || null;
}

export async function searchPatients(searchTerm) {
  const term = (searchTerm || '').toLowerCase().trim();
  if (isConfigured && db) {
    const snap = await getDocs(collection(db, 'patients'));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) =>
        (p.phone && p.phone.toLowerCase().includes(term)) ||
        (p.name && p.name.toLowerCase().includes(term))
      );
  }
  return demoStore.patients.filter((p) =>
    (p.phone && p.phone.toLowerCase().includes(term)) ||
    (p.name && p.name.toLowerCase().includes(term))
  );
}

export async function createPatient(patientData) {
  if (isConfigured && db) {
    const docRef = patientData.id ? doc(db, 'patients', patientData.id) : doc(collection(db, 'patients'));
    const toSave = {
      ...patientData,
      id: docRef.id,
      hasSmartphone: Boolean(patientData.hasSmartphone),
    };
    await setDoc(docRef, toSave, { merge: true });
    return toSave;
  }
  const id = patientData.id || `pat-${Date.now()}`;
  const record = { ...patientData, id, hasSmartphone: Boolean(patientData.hasSmartphone) };
  demoStore.patients.push(record);
  return record;
}

/* =========================================================================
   5. QUEUES: id, doctorId, date, maxTokens, currentNumber, status (open | stopped | on_hold | ended), holdNote
   ========================================================================= */

export async function getDoctorQueueForDate(doctorId, dateString) {
  const date = dateString || new Date().toISOString().slice(0, 10);
  if (isConfigured && db) {
    const q = query(
      collection(db, 'queues'),
      where('doctorId', '==', doctorId),
      where('date', '==', date)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
    return null;
  }
  return demoStore.queues.find((q) => q.doctorId === doctorId && q.date === date) || null;
}

export async function createOrUpdateQueue(queueData) {
  if (isConfigured && db) {
    const docRef = queueData.id ? doc(db, 'queues', queueData.id) : doc(collection(db, 'queues'));
    const toSave = { ...queueData, id: docRef.id };
    await setDoc(docRef, toSave, { merge: true });
    return toSave;
  }
  const id = queueData.id || `queue-${Date.now()}`;
  const record = { ...queueData, id };
  demoStore.queues = demoStore.queues.filter((q) => q.id !== id);
  demoStore.queues.push(record);
  return record;
}

export function subscribeToDoctorQueue(doctorId, dateString, callback) {
  const date = dateString || new Date().toISOString().slice(0, 10);
  if (isConfigured && db) {
    const q = query(
      collection(db, 'queues'),
      where('doctorId', '==', doctorId),
      where('date', '==', date)
    );
    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        callback({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        callback(null);
      }
    });
  }
  const item = demoStore.queues.find((q) => q.doctorId === doctorId && q.date === date);
  callback(item || null);
  return () => {};
}

/* =========================================================================
   6. TOKENS: id, doctorId, patientId, number, date, status (waiting | serving | done | skipped), source (online | desk | phone), createdAt
   ========================================================================= */

export async function createToken(tokenData) {
  const payload = {
    ...tokenData,
    date: tokenData.date || new Date().toISOString().slice(0, 10),
    status: tokenData.status || 'waiting',
    source: tokenData.source || 'desk',
    createdAt: new Date().toISOString(),
  };

  if (isConfigured && db) {
    const docRef = tokenData.id ? doc(db, 'tokens', tokenData.id) : doc(collection(db, 'tokens'));
    const toSave = { ...payload, id: docRef.id };
    await setDoc(docRef, toSave, { merge: true });
    return toSave;
  }

  const id = tokenData.id || `tok-${Date.now()}`;
  const record = { ...payload, id };
  demoStore.tokens.push(record);
  return record;
}

export async function updateTokenStatus(tokenId, newStatus) {
  if (isConfigured && db) {
    await updateDoc(doc(db, 'tokens', tokenId), { status: newStatus });
    return true;
  }
  const token = demoStore.tokens.find((t) => t.id === tokenId);
  if (token) token.status = newStatus;
  return true;
}

export function subscribeToTokens(doctorId, dateString, callback) {
  const date = dateString || new Date().toISOString().slice(0, 10);
  if (isConfigured && db) {
    const q = query(
      collection(db, 'tokens'),
      where('doctorId', '==', doctorId),
      where('date', '==', date)
    );
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => (a.number || 0) - (b.number || 0));
      callback(items);
    });
  }
  const items = demoStore.tokens
    .filter((t) => t.doctorId === doctorId && t.date === date)
    .sort((a, b) => a.number - b.number);
  callback(items);
  return () => {};
}

/* =========================================================================
   7. PRESCRIPTIONS: id, patientId, doctorId, hospitalId, date, medicines, tests
   ========================================================================= */

export async function createPrescription(rxData) {
  const payload = {
    ...rxData,
    date: rxData.date || new Date().toISOString().slice(0, 10),
    medicines: rxData.medicines || [],
    tests: rxData.tests || [],
  };

  if (isConfigured && db) {
    const docRef = rxData.id ? doc(db, 'prescriptions', rxData.id) : doc(collection(db, 'prescriptions'));
    const toSave = { ...payload, id: docRef.id };
    await setDoc(docRef, toSave, { merge: true });
    return toSave;
  }

  const id = rxData.id || `rx-${Date.now()}`;
  const record = { ...payload, id };
  demoStore.prescriptions.push(record);
  return record;
}

export function subscribeToPatientPrescriptions(patientId, callback) {
  if (isConfigured && db) {
    const q = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }
  callback(demoStore.prescriptions.filter((p) => p.patientId === patientId));
  return () => {};
}

/* =========================================================================
   8. REPORTS: id, patientId, doctorId, hospitalId, date, title, notes
   ========================================================================= */

export async function createReport(reportData) {
  const payload = {
    ...reportData,
    date: reportData.date || new Date().toISOString().slice(0, 10),
  };

  if (isConfigured && db) {
    const docRef = reportData.id ? doc(db, 'reports', reportData.id) : doc(collection(db, 'reports'));
    const toSave = { ...payload, id: docRef.id };
    await setDoc(docRef, toSave, { merge: true });
    return toSave;
  }

  const id = reportData.id || `rep-${Date.now()}`;
  const record = { ...payload, id };
  demoStore.reports.push(record);
  return record;
}

export function subscribeToPatientReports(patientId, callback) {
  if (isConfigured && db) {
    const q = query(
      collection(db, 'reports'),
      where('patientId', '==', patientId)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }
  callback(demoStore.reports.filter((r) => r.patientId === patientId));
  return () => {};
}

/* =========================================================================
   9. DOSE LOGS: id, patientId, prescriptionId, medicineName, scheduledTime, status (pending | taken | missed)
   ========================================================================= */

export async function createDoseLog(logData) {
  const payload = {
    ...logData,
    status: logData.status || 'pending',
  };

  if (isConfigured && db) {
    const docRef = logData.id ? doc(db, 'doseLogs', logData.id) : doc(collection(db, 'doseLogs'));
    const toSave = { ...payload, id: docRef.id };
    await setDoc(docRef, toSave, { merge: true });
    return toSave;
  }

  const id = logData.id || `dose-${Date.now()}`;
  const record = { ...payload, id };
  demoStore.doseLogs.push(record);
  return record;
}

export async function updateDoseLogStatus(doseLogId, newStatus) {
  if (isConfigured && db) {
    await updateDoc(doc(db, 'doseLogs', doseLogId), { status: newStatus });
    return true;
  }
  const item = demoStore.doseLogs.find((d) => d.id === doseLogId);
  if (item) item.status = newStatus;
  return true;
}

export function subscribeToDoseLogs(patientId, callback) {
  if (isConfigured && db) {
    const q = query(
      collection(db, 'doseLogs'),
      where('patientId', '==', patientId)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }
  callback(demoStore.doseLogs.filter((d) => d.patientId === patientId));
  return () => {};
}

/* =========================================================================
   10. SMS MESSAGES: id, patientId, text, createdAt
   ========================================================================= */

export async function sendMockSms(patientId, text) {
  const payload = {
    patientId,
    text,
    createdAt: new Date().toISOString(),
  };

  if (isConfigured && db) {
    const docRef = doc(collection(db, 'smsMessages'));
    const toSave = { ...payload, id: docRef.id };
    await setDoc(docRef, toSave);
    return toSave;
  }

  const id = `sms-${Date.now()}`;
  const record = { ...payload, id };
  demoStore.smsMessages.push(record);
  return record;
}

export function subscribeToSmsMessages(patientId, callback) {
  if (isConfigured && db) {
    const q = query(
      collection(db, 'smsMessages'),
      where('patientId', '==', patientId)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }
  callback(demoStore.smsMessages.filter((s) => s.patientId === patientId));
  return () => {};
}
