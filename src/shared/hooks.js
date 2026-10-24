import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc } from 'firebase/firestore';
import { db, isConfigured } from './firebase';

export { useCurrentPatient } from './useCurrentPatient';

/**
 * Reusable hook for real-time Firestore collection listener.
 * Whenever documents in the collection change, the callback receives live updates.
 * Falls back to an empty array or initial data in demo mode.
 */
export function useLiveCollection(collectionName, initialData = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(isConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isConfigured || !db) {
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, collectionName));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error(`Firestore live error on ${collectionName}:`, err);
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error(`Firestore hook setup error:`, err);
      setError(err);
      setLoading(false);
    }
  }, [collectionName]);

  return { data, loading, error };
}

/**
 * Reusable hook for real-time Firestore single document listener.
 */
export function useLiveDocument(collectionName, docId, initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(isConfigured && Boolean(docId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isConfigured || !db || !docId) {
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(db, collectionName, docId);
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setData({ id: docSnap.id, ...docSnap.data() });
          } else {
            setData(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error(`Firestore live error on ${collectionName}/${docId}:`, err);
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error(`Firestore doc hook error:`, err);
      setError(err);
      setLoading(false);
    }
  }, [collectionName, docId]);

  return { data, loading, error };
}
