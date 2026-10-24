import { collection, doc, setDoc } from 'firebase/firestore';
import { db, isConfigured } from '../../shared/firebase.js';
import { getDemoStore, setDemoStore } from '../../shared/dataService.js';

/**
 * Helper to dispatch simulated SMS messages to patients without smartphones
 * (conforming to DATA_MODEL.md smsMessages collection).
 *
 * @param {string} patientId - Target patient document ID
 * @param {string} text - The SMS message body (e.g. "Token 40. Now serving 35. 5 to go.")
 * @returns {Promise<{ id: string, patientId: string, text: string, createdAt: string }>}
 */
export async function sendMockSms(patientId, text) {
  if (!patientId || !text) {
    console.warn('sendMockSms: patientId and text are required.');
    return null;
  }

  const payload = {
    id: `sms_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    patientId,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  // 1. Live Firestore write when configured
  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'smsMessages', payload.id);
      await setDoc(docRef, payload);
    } catch (e) {
      console.warn('Firestore write error in sendMockSms:', e);
    }
  }

  // 2. Synchronize with local demo store & localStorage
  try {
    const store = getDemoStore();
    const existing = store.smsMessages || [];
    const updated = [payload, ...existing];
    setDemoStore({ ...store, smsMessages: updated });
  } catch (e) {
    console.warn('Could not update demo store for SMS:', e);
  }

  // 3. Dispatch window event for instantaneous UI feedback
  try {
    window.dispatchEvent(new CustomEvent('mediflow_sms_sent', { detail: payload }));
  } catch (e) {}

  return payload;
}

export default sendMockSms;
