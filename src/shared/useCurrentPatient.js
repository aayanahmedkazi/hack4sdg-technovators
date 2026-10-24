import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, isConfigured } from './firebase';

/**
 * Custom live hook that returns the patientId of the token whose status
 * is "serving" for the given doctor today, using a live Firestore listener.
 * Returns null if no patient is currently being served or doctorId is not provided.
 *
 * @param {string} doctorId - The ID of the doctor
 * @returns {string | null} patientId of the currently serving token, or null
 */
export function useCurrentPatient(doctorId) {
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    if (!doctorId) {
      setPatientId(null);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    if (isConfigured && db) {
      const tokensRef = collection(db, 'tokens');
      const q = query(
        tokensRef,
        where('doctorId', '==', doctorId),
        where('date', '==', today),
        where('status', '==', 'serving')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const activeToken = snapshot.docs[0].data();
            setPatientId(activeToken.patientId || null);
          } else {
            setPatientId(null);
          }
        },
        (error) => {
          console.error('Firestore live listener error in useCurrentPatient:', error);
          setPatientId(null);
        }
      );

      return () => unsubscribe();
    } else {
      // Demo mode fallback when Firebase keys are not configured yet
      if (doctorId === 'doc-001' || doctorId.includes('doc')) {
        setPatientId('pat-001');
      } else {
        setPatientId(null);
      }
    }
  }, [doctorId]);

  return patientId;
}

export default useCurrentPatient;
