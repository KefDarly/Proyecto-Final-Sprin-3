import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { PetroMapiData } from './db';

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);

const DOC_PATH = 'state';
const COLLECTION_PATH = 'petromapi';

// Reference to our single document in Cloud Firestore
const stateDocRef = doc(firestore, COLLECTION_PATH, DOC_PATH);

/**
 * Checks connection state and loads/subscribes to database changes in Firestore.
 */
export function subscribeToFirestore(
  onData: (data: PetroMapiData) => void,
  onStatusChange: (status: { connected: boolean; error: string | null; lastSync: string }) => void,
  defaultData: PetroMapiData
) {
  onStatusChange({ connected: false, error: null, lastSync: 'Conectando...' });

  // Initial load check
  getDoc(stateDocRef)
    .then((docSnap) => {
      if (!docSnap.exists()) {
        // Document does not exist in Cloud, write the initial seed data
        setDoc(stateDocRef, defaultData)
          .then(() => {
            onStatusChange({ connected: true, error: null, lastSync: new Date().toLocaleTimeString() });
          })
          .catch((err) => {
            console.warn('Notice: Writing initial seed to Firestore deferred/queued:', err.message);
          });
      }
    })
    .catch((err) => {
      const isOfflineMsg = err?.message?.toLowerCase().includes('offline') || err?.code === 'unavailable';
      if (isOfflineMsg) {
        console.warn('Firestore is offline. Scaling down to Local Storage backup mode gracefully.', err.message);
        onStatusChange({
          connected: false,
          error: 'Trabajando en modo local seguro. Se sincronizará automáticamente al detectar conexión.',
          lastSync: 'Local Cache'
        });
      } else {
        console.warn('Notice: Firestore getDoc error handled gracefully:', err.message || err);
      }
    });

  // Real-time listener
  const unsubscribe = onSnapshot(
    stateDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PetroMapiData;
        onData(data);
        onStatusChange({
          connected: true,
          error: null,
          lastSync: new Date().toLocaleTimeString()
        });
      } else {
        onStatusChange({
          connected: true,
          error: 'Colección vacía. Inicializando...',
          lastSync: new Date().toLocaleTimeString()
        });
      }
    },
    (error) => {
      console.warn('Firestore snapshot/sync listener warning:', error.message || error);
      onStatusChange({
        connected: false,
        error: error.message,
        lastSync: 'Fallo de conexión'
      });
    }
  );

  return unsubscribe;
}

/**
 * Persists the entire database state to the Firebase cloud Firestore database.
 */
export async function saveToFirestore(data: PetroMapiData): Promise<void> {
  try {
    await setDoc(stateDocRef, data);
  } catch (error) {
    console.warn('Handling Firestore save queue status background:', error);
    // Background queue handles offline, we throw to allow callers to present UI if needed but don't dump critical errors
    throw error;
  }
}

/**
 * Exposing configuration details for transparency/education in UI
 */
export const dbConnectionDetails = {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || 'default',
  storageBucket: firebaseConfig.storageBucket,
};
