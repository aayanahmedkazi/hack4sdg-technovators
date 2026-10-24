/**
 * Demo configuration and mock data helpers for MediFlow.
 * Used for testing without requiring a live backend setup.
 */

export const DEMO_USERS = {
  patient: {
    uid: 'demo-patient-001',
    email: 'patient@mediflow.local',
    displayName: 'Aarav Sharma (Patient)',
    role: 'patient',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
  },
  receptionist: {
    uid: 'demo-receptionist-001',
    email: 'reception@mediflow.local',
    displayName: 'Priya Patel (Receptionist)',
    role: 'receptionist',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
  },
  doctor: {
    uid: 'demo-doctor-001',
    email: 'doctor@mediflow.local',
    displayName: 'Dr. Sameer Khan (Cardiologist)',
    role: 'doctor',
    photoURL: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80',
  },
};

export * from './seedDemoData.js';

