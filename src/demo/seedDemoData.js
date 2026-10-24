import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db, isConfigured } from '../shared/firebase.js';
import { setDemoStore, clearDemoStore } from '../shared/dataService.js';

/**
 * Standardized Demo Data conforming strictly to MediFlow DATA_MODEL.md
 * 
 * Includes:
 * - 1 Primary Hospital ("City Care Hospital") + 1 Second Hospital ("Metro Community Hospital")
 * - 2 Doctors: Dr. Sameer Khan (Cardiology) & Dr. Ananya Sharma (General Medicine)
 * - 10 Patients (with diverse ages, 4 with hasSmartphone = false for SMS-only fallback)
 * - Clinical Prescriptions & Diagnostic Reports spread across 2 hospitals and varied dates
 * - Today's Live Queues, Tokens, Medication Dose Logs, and Simulated SMS messages
 * - Demo user accounts for Patient, Receptionist, and Doctor roles
 */

// Format today's date in YYYY-MM-DD
const TODAY = new Date().toISOString().slice(0, 10);

export const DEMO_DATA = {
  // 1. users: id, name, role ('patient' | 'receptionist' | 'doctor'), phone
  users: [
    {
      id: 'demo-patient-001',
      name: 'Aarav Sharma',
      role: 'patient',
      phone: '+91 98765 43210',
    },
    {
      id: 'demo-receptionist-001',
      name: 'Priya Patel',
      role: 'receptionist',
      phone: '+91 98765 43211',
    },
    {
      id: 'demo-doctor-001',
      name: 'Dr. Sameer Khan',
      role: 'doctor',
      phone: '+91 98765 43212',
    },
    {
      id: 'demo-doctor-002',
      name: 'Dr. Ananya Sharma',
      role: 'doctor',
      phone: '+91 98765 43213',
    },
  ],

  // 2. hospitals: id, name
  hospitals: [
    {
      id: 'hospital-city-care',
      name: 'City Care Hospital',
    },
    {
      // Alias for backwards compatibility with any component referencing 'hospital-main'
      id: 'hospital-main',
      name: 'City Care Hospital',
    },
    {
      id: 'hospital-metro',
      name: 'Metro Community Hospital',
    },
  ],

  // 3. doctors: id, userId, hospitalId, name, speciality
  doctors: [
    {
      id: 'doc-001',
      userId: 'demo-doctor-001',
      hospitalId: 'hospital-city-care',
      name: 'Dr. Sameer Khan',
      speciality: 'Cardiology',
    },
    {
      id: 'doc-002',
      userId: 'demo-doctor-002',
      hospitalId: 'hospital-metro',
      name: 'Dr. Ananya Sharma',
      speciality: 'General Medicine',
    },
  ],

  // 4. patients: id, userId, name, age, gender, phone, address, hasSmartphone, registeredBy
  // 10 patients total, 4 with hasSmartphone: false
  patients: [
    {
      id: 'pat-001',
      userId: 'demo-patient-001',
      name: 'Aarav Sharma',
      age: 34,
      gender: 'Male',
      phone: '+91 98765 43210',
      address: 'B-104, Sunrise Apartments, Indiranagar, Bengaluru',
      hasSmartphone: true,
      registeredBy: 'demo-receptionist-001',
    },
    {
      id: 'pat-002',
      userId: null,
      name: 'Lakshmi Devi',
      age: 62,
      gender: 'Female',
      phone: '+91 98111 22334',
      address: '12, Old Temple Street, Malleshwaram, Bengaluru',
      hasSmartphone: false, // SMS only
      registeredBy: 'demo-receptionist-001',
    },
    {
      id: 'pat-003',
      userId: null,
      name: 'Rajesh Kumar Verma',
      age: 48,
      gender: 'Male',
      phone: '+91 98450 11223',
      address: '45/2, 4th Cross, Koramangala 5th Block, Bengaluru',
      hasSmartphone: true,
      registeredBy: 'demo-receptionist-001',
    },
    {
      id: 'pat-004',
      userId: null,
      name: 'Meera Nair',
      age: 29,
      gender: 'Female',
      phone: '+91 97400 33445',
      address: 'Flat 302, Green Glen Layout, Bellandur, Bengaluru',
      hasSmartphone: true,
      registeredBy: 'demo-receptionist-001',
    },
    {
      id: 'pat-005',
      userId: null,
      name: 'Rameshwar Gupta',
      age: 71,
      gender: 'Male',
      phone: '+91 98220 55667',
      address: 'House #8, Gandhi Bazaar Main Road, Basavanagudi, Bengaluru',
      hasSmartphone: false, // SMS only
      registeredBy: 'demo-receptionist-001',
    },
    {
      id: 'pat-006',
      userId: null,
      name: 'Sunita Deshmukh',
      age: 42,
      gender: 'Female',
      phone: '+91 99000 66778',
      address: '22, Rose Garden Enclave, Whitefield, Bengaluru',
      hasSmartphone: true,
      registeredBy: 'demo-receptionist-001',
    },
    {
      id: 'pat-007',
      userId: null,
      name: 'Fatima Zahra',
      age: 25,
      gender: 'Female',
      phone: '+91 96111 77889',
      address: 'C-7, Mosque Road, Frazer Town, Bengaluru',
      hasSmartphone: true,
      registeredBy: 'demo-receptionist-001',
    },
    {
      id: 'pat-008',
      userId: null,
      name: 'Vikramjit Singh',
      age: 55,
      gender: 'Male',
      phone: '+91 98888 88990',
      address: '91, Defense Colony, HAL 2nd Stage, Bengaluru',
      hasSmartphone: false, // SMS only
      registeredBy: 'demo-receptionist-001',
    },
    {
      id: 'pat-009',
      userId: null,
      name: 'Kavita Pillai',
      age: 38,
      gender: 'Female',
      phone: '+91 97333 99001',
      address: '104, Lakeview Residency, Hebbal, Bengaluru',
      hasSmartphone: true,
      registeredBy: 'demo-receptionist-001',
    },
    {
      id: 'pat-010',
      userId: null,
      name: 'Hassan Ali',
      age: 67,
      gender: 'Male',
      phone: '+91 94444 12345',
      address: 'Plot 15, Railway Station Road, Yeshwanthpur, Bengaluru',
      hasSmartphone: false, // SMS only
      registeredBy: 'demo-receptionist-001',
    },
  ],

  // 5. queues: id, doctorId, date, maxTokens, currentNumber, status ('open' | 'stopped' | 'on_hold' | 'ended'), holdNote
  queues: [
    {
      id: 'queue-doc001-today',
      doctorId: 'doc-001',
      date: TODAY,
      maxTokens: 40,
      currentNumber: 3,
      status: 'open',
      holdNote: '',
    },
    {
      id: 'queue-doc002-today',
      doctorId: 'doc-002',
      date: TODAY,
      maxTokens: 30,
      currentNumber: 1,
      status: 'open',
      holdNote: '',
    },
  ],

  // 6. tokens: id, doctorId, patientId, number, date, status ('waiting' | 'serving' | 'done' | 'skipped'), source ('online' | 'desk' | 'phone'), createdAt
  tokens: [
    {
      id: 'tok-001',
      doctorId: 'doc-001',
      patientId: 'pat-001',
      number: 1,
      date: TODAY,
      status: 'done',
      source: 'online',
      createdAt: `${TODAY}T08:30:00.000Z`,
    },
    {
      id: 'tok-002',
      doctorId: 'doc-001',
      patientId: 'pat-002',
      number: 2,
      date: TODAY,
      status: 'done',
      source: 'desk',
      createdAt: `${TODAY}T08:45:00.000Z`,
    },
    {
      id: 'tok-003',
      doctorId: 'doc-001',
      patientId: 'pat-001',
      number: 3,
      date: TODAY,
      status: 'serving',
      source: 'online',
      createdAt: `${TODAY}T09:00:00.000Z`,
    },
    {
      id: 'tok-004',
      doctorId: 'doc-001',
      patientId: 'pat-003',
      number: 4,
      date: TODAY,
      status: 'waiting',
      source: 'desk',
      createdAt: `${TODAY}T09:15:00.000Z`,
    },
    {
      id: 'tok-005',
      doctorId: 'doc-001',
      patientId: 'pat-005',
      number: 5,
      date: TODAY,
      status: 'waiting',
      source: 'phone',
      createdAt: `${TODAY}T09:30:00.000Z`,
    },
  ],

  // 7. prescriptions: id, patientId, doctorId, hospitalId, date, medicines, tests
  // Spread over 2 hospitals ("City Care Hospital" & "Metro Community Hospital") and multiple dates
  prescriptions: [
    {
      id: 'rx-001',
      patientId: 'pat-001',
      doctorId: 'doc-001',
      hospitalId: 'hospital-city-care',
      date: TODAY,
      medicines: [
        {
          name: 'Metoprolol Tartrate 25mg',
          dose: '1 tablet',
          timesPerDay: 2,
          timings: ['08:00', '20:00'],
          durationDays: 30,
          remarks: 'Take after meals for heart rate and blood pressure control',
        },
        {
          name: 'Atorvastatin 10mg',
          dose: '1 tablet',
          timesPerDay: 1,
          timings: ['21:00'],
          durationDays: 30,
          remarks: 'Take at night before bedtime',
        },
      ],
      tests: [
        {
          name: 'Complete Blood Count (CBC)',
          date: (() => {
            const tm = new Date();
            tm.setDate(tm.getDate() + 1);
            return tm.toISOString().slice(0, 10);
          })(),
        },
        {
          name: 'Fasting Lipid Profile',
          date: `${TODAY.slice(0, 8)}28`,
        },
      ],
    },
    {
      id: 'rx-002',
      patientId: 'pat-001',
      doctorId: 'doc-002',
      hospitalId: 'hospital-metro',
      date: '2026-08-15',
      medicines: [
        {
          name: 'Amoxicillin 500mg',
          dose: '1 capsule',
          timesPerDay: 3,
          timings: ['08:00', '14:00', '20:00'],
          durationDays: 7,
          remarks: 'Complete full 7-day course with full glass of water',
        },
        {
          name: 'Paracetamol 650mg',
          dose: '1 tablet',
          timesPerDay: 2,
          timings: ['08:00', '20:00'],
          durationDays: 5,
          remarks: 'Take SOS for high fever or headache after food',
        },
      ],
      tests: [
        {
          name: 'Complete Blood Count (CBC)',
          date: '2026-08-16',
        },
      ],
    },
    {
      id: 'rx-003',
      patientId: 'pat-001',
      doctorId: 'doc-001',
      hospitalId: 'hospital-city-care',
      date: '2026-04-10',
      medicines: [
        {
          name: 'Cetirizine 10mg',
          dose: '1 tablet',
          timesPerDay: 1,
          timings: ['21:00'],
          durationDays: 14,
          remarks: 'Antihistamine for seasonal pollen allergy',
        },
        {
          name: 'Fluticasone Propionate Spray',
          dose: '2 sprays',
          timesPerDay: 1,
          timings: ['08:00'],
          durationDays: 21,
          remarks: '1 spray each nostril daily morning',
        },
      ],
      tests: [],
    },
    {
      id: 'rx-004',
      patientId: 'pat-002',
      doctorId: 'doc-001',
      hospitalId: 'hospital-city-care',
      date: '2026-10-18',
      medicines: [
        {
          name: 'Metformin 500mg',
          dose: '1 tablet',
          timesPerDay: 2,
          timings: ['08:00', '20:00'],
          durationDays: 60,
          remarks: 'Take during or immediately after meals',
        },
        {
          name: 'Glimepiride 1mg',
          dose: '1 tablet',
          timesPerDay: 1,
          timings: ['08:00'],
          durationDays: 60,
          remarks: 'Take 15 minutes before breakfast',
        },
      ],
      tests: [
        {
          name: 'HbA1c Glycated Hemoglobin',
          date: '2026-10-20',
        },
      ],
    },
    {
      id: 'rx-005',
      patientId: 'pat-003',
      doctorId: 'doc-002',
      hospitalId: 'hospital-metro',
      date: '2026-09-05',
      medicines: [
        {
          name: 'Telmisartan 40mg',
          dose: '1 tablet',
          timesPerDay: 1,
          timings: ['09:00'],
          durationDays: 30,
          remarks: 'Daily morning dose for hypertension',
        },
        {
          name: 'Pantoprazole 40mg',
          dose: '1 tablet',
          timesPerDay: 1,
          timings: ['07:30'],
          durationDays: 15,
          remarks: 'Take empty stomach 30 mins before breakfast',
        },
      ],
      tests: [
        {
          name: 'Serum Electrolytes & Creatinine',
          date: '2026-09-06',
        },
      ],
    },
    {
      id: 'rx-006',
      patientId: 'pat-004',
      doctorId: 'doc-002',
      hospitalId: 'hospital-metro',
      date: '2026-07-22',
      medicines: [
        {
          name: 'Ferrous Ascorbate 100mg',
          dose: '1 tablet',
          timesPerDay: 1,
          timings: ['14:00'],
          durationDays: 30,
          remarks: 'Take 2 hours after lunch with citrus or water',
        },
        {
          name: 'Folic Acid 5mg',
          dose: '1 tablet',
          timesPerDay: 1,
          timings: ['14:00'],
          durationDays: 30,
          remarks: 'Take alongside iron supplement',
        },
      ],
      tests: [
        {
          name: 'Serum Ferritin Panel',
          date: '2026-07-23',
        },
      ],
    },
    {
      id: 'rx-007',
      patientId: 'pat-005',
      doctorId: 'doc-001',
      hospitalId: 'hospital-city-care',
      date: '2026-06-12',
      medicines: [
        {
          name: 'Glucosamine Sulfate 500mg',
          dose: '1 tablet',
          timesPerDay: 2,
          timings: ['08:00', '20:00'],
          durationDays: 60,
          remarks: 'Joint cartilage support',
        },
        {
          name: 'Calcium + Vitamin D3',
          dose: '1 tablet',
          timesPerDay: 1,
          timings: ['12:00'],
          durationDays: 60,
          remarks: 'Take after lunch',
        },
      ],
      tests: [
        {
          name: 'Bilateral Knee X-Ray (Standing)',
          date: '2026-06-14',
        },
      ],
    },
  ],

  // 8. reports: id, patientId, doctorId, hospitalId, date, title, notes
  // Spread over 2 hospitals and different dates so record folders look rich and complete
  reports: [
    {
      id: 'rep-001',
      patientId: 'pat-001',
      doctorId: 'doc-001',
      hospitalId: 'hospital-city-care',
      date: TODAY,
      title: 'Cardiology Review & Resting 12-Lead ECG',
      notes: 'Patient presented for routine cardiovascular evaluation. Vitals: BP 130/84 mmHg, regular sinus rhythm at 72 bpm. 12-lead ECG confirmed normal trace with no ST changes. Mild borderline hyperlipidemia noted. Prescribed low-dose beta-blocker and statin. Advised 30 minutes brisk walking daily.',
    },
    {
      id: 'rep-002',
      patientId: 'pat-001',
      doctorId: 'doc-002',
      hospitalId: 'hospital-metro',
      date: '2026-08-15',
      title: 'Acute Upper Respiratory Infection Evaluation',
      notes: 'Patient reported persistent dry cough and low-grade fever for 3 days. SpO2 98% on room air. Lungs clear with occasional end-expiratory rhonchi. CBC indicated mild leukocytosis indicative of acute infection. Prescribed oral antibiotic course and supportive medication.',
    },
    {
      id: 'rep-003',
      patientId: 'pat-001',
      doctorId: 'doc-001',
      hospitalId: 'hospital-city-care',
      date: '2026-04-10',
      title: 'Seasonal Allergic Rhinitis Assessment',
      notes: 'Patient experienced seasonal nasal congestion, watery eyes, and sneezing bouts triggered by pollen. Vitals normal. Nasal turbinates swollen and pale. Prescribed non-sedating antihistamine and corticosteroid nasal spray. Follow-up confirmed clear resolution.',
    },
    {
      id: 'rep-004',
      patientId: 'pat-002',
      doctorId: 'doc-001',
      hospitalId: 'hospital-city-care',
      date: '2026-10-18',
      title: 'Type-2 Diabetes Management & Blood Sugar Follow-up',
      notes: 'Fasting blood sugar 138 mg/dL, postprandial 178 mg/dL. Renal function and microalbuminuria tests normal. Bilateral pedal pulses palpable, peripheral sensation intact. Dose adjusted for optimal glycemic control.',
    },
    {
      id: 'rep-005',
      patientId: 'pat-003',
      doctorId: 'doc-002',
      hospitalId: 'hospital-metro',
      date: '2026-09-05',
      title: 'Essential Hypertension Checkup',
      notes: 'BP recorded at 138/88 mmHg. Patient reported good medication compliance without adverse effects. Baseline renal profile and electrolytes normal. Continued Telmisartan therapy with dietary sodium restriction.',
    },
    {
      id: 'rep-006',
      patientId: 'pat-004',
      doctorId: 'doc-002',
      hospitalId: 'hospital-metro',
      date: '2026-07-22',
      title: 'Anemia Screening & Iron Supplementation Plan',
      notes: 'Hemoglobin evaluated at 10.2 g/dL with microcytic hypochromic picture. Peripheral smear showed iron deficiency. Prescribed oral iron therapy for 30 days along with nutritional guidance on iron-rich foods.',
    },
    {
      id: 'rep-007',
      patientId: 'pat-005',
      doctorId: 'doc-001',
      hospitalId: 'hospital-city-care',
      date: '2026-06-12',
      title: 'Bilateral Knee Osteoarthritis & Mobility Checkup',
      notes: 'Senior patient with bilateral knee joint crepitus and stiffness on standing. X-Ray revealed mild joint space narrowing (Kellgren-Lawrence Grade 2). Advised isometric quadriceps exercises, weight bearing management, and knee brace during long walks.',
    },
  ],

  // 9. doseLogs: id, patientId, prescriptionId, medicineName, scheduledTime, status ('pending' | 'taken' | 'missed')
  doseLogs: [
    {
      id: 'dose-001',
      patientId: 'pat-001',
      prescriptionId: 'rx-001',
      medicineName: 'Metoprolol Tartrate 25mg',
      scheduledTime: `${TODAY} 08:00`,
      status: 'taken',
    },
    {
      id: 'dose-002',
      patientId: 'pat-001',
      prescriptionId: 'rx-001',
      medicineName: 'Metoprolol Tartrate 25mg',
      scheduledTime: `${TODAY} 20:00`,
      status: 'pending',
    },
    {
      id: 'dose-003',
      patientId: 'pat-001',
      prescriptionId: 'rx-001',
      medicineName: 'Atorvastatin 10mg',
      scheduledTime: `${TODAY} 21:00`,
      status: 'pending',
    },
  ],

  // 10. smsMessages: id, patientId, text, createdAt
  smsMessages: [
    {
      id: 'sms-001',
      patientId: 'pat-002',
      text: 'MediFlow Alert: Hello Lakshmi Devi, your token #2 is completed at City Care Hospital.',
      createdAt: `${TODAY}T08:50:00.000Z`,
    },
    {
      id: 'sms-002',
      patientId: 'pat-005',
      text: 'MediFlow Alert: Hello Rameshwar Gupta, token #3 is now serving in Doctor Room 1. Your token is #5.',
      createdAt: `${TODAY}T09:02:00.000Z`,
    },
  ],
};

/**
 * Seeds Firestore with the sample demo data conforming to DATA_MODEL.md.
 * If running in offline demo mode, updates the in-memory/localStorage demo store.
 * 
 * @returns {Promise<{ success: boolean, count: number, message: string, details: Record<string, number> }>}
 */
export async function seedDemoData() {
  const collectionNames = Object.keys(DEMO_DATA);
  const details = {};
  let totalCount = 0;

  collectionNames.forEach((key) => {
    details[key] = DEMO_DATA[key].length;
    totalCount += DEMO_DATA[key].length;
  });

  // Always update the in-memory fallback store & localStorage
  setDemoStore(DEMO_DATA);

  // If live Firebase Firestore is configured, write batch into Firestore
  if (isConfigured && db) {
    try {
      const batch = writeBatch(db);

      for (const colName of collectionNames) {
        const items = DEMO_DATA[colName];
        for (const item of items) {
          const docRef = doc(db, colName, item.id);
          batch.set(docRef, item, { merge: true });
        }
      }

      await batch.commit();

      return {
        success: true,
        count: totalCount,
        firestoreSynced: true,
        details,
        message: `Successfully loaded ${totalCount} records into Firestore across ${collectionNames.length} collections!`,
      };
    } catch (error) {
      console.error('Error committing seed batch to Firestore:', error);
      // Fallback response with notice of offline sync
      return {
        success: false,
        count: totalCount,
        firestoreSynced: false,
        error: error.message,
        details,
        message: `Firestore write encountered an issue (${error.message}), but local demo store was successfully populated with ${totalCount} records.`,
      };
    }
  }

  return {
    success: true,
    count: totalCount,
    firestoreSynced: false,
    details,
    message: `Running in Demo Mode: Local demo store loaded with ${totalCount} sample records across ${collectionNames.length} collections!`,
  };
}

/**
 * Resets or clears the sample demo data from Firestore and local demo stores.
 * 
 * @returns {Promise<{ success: boolean, count: number, message: string }>}
 */
export async function resetDemoData() {
  const collectionNames = Object.keys(DEMO_DATA);
  let totalDeleted = 0;

  // Clear in-memory / local storage demo store
  clearDemoStore();

  // If live Firebase Firestore is configured, delete demo documents by ID
  if (isConfigured && db) {
    try {
      const batch = writeBatch(db);

      for (const colName of collectionNames) {
        const items = DEMO_DATA[colName];
        for (const item of items) {
          const docRef = doc(db, colName, item.id);
          batch.delete(docRef);
          totalDeleted += 1;
        }
      }

      await batch.commit();

      return {
        success: true,
        count: totalDeleted,
        firestoreSynced: true,
        message: `Successfully reset and deleted ${totalDeleted} demo documents from Firestore.`,
      };
    } catch (error) {
      console.error('Error resetting Firestore demo data:', error);
      return {
        success: false,
        error: error.message,
        firestoreSynced: false,
        message: `Could not delete all documents from Firestore: ${error.message}. Local demo store was reset.`,
      };
    }
  }

  collectionNames.forEach((key) => {
    totalDeleted += DEMO_DATA[key].length;
  });

  return {
    success: true,
    count: totalDeleted,
    firestoreSynced: false,
    message: 'Local demo store has been reset to an empty state.',
  };
}
