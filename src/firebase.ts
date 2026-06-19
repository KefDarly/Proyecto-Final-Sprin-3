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
            console.error('Error writing initial seed to Firestore:', err);
            onStatusChange({ connected: false, error: err.message, lastSync: 'Error de inicialización' });
          });
      }
    })
    .catch((err) => {
      console.error('Error reading initial doc from Firestore:', err);
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
      console.error('Firestore listener error:', error);
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
    console.error('Error saving state to Firestore:', error);
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
