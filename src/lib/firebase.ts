import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const requiredEnv: Array<[string, string]> = [
  ['VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY],
  ['VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN],
  ['VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID],
  ['VITE_FIREBASE_STORAGE_BUCKET', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET],
  ['VITE_FIREBASE_MESSAGING_SENDER_ID', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID],
  ['VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID]
];

const missing = requiredEnv.filter(([, value]) => !value);

export const isFirebaseConfigured = missing.length === 0;

const firebaseConfig = isFirebaseConfigured
  ? {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    }
  : null;

export const firebaseApp = firebaseConfig
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const storage = firebaseApp ? getStorage(firebaseApp) : null;

if (!isFirebaseConfigured) {
  const missingKeys = missing.map(([key]) => key).join(', ');
  console.warn(
    `Firebase no está configurado. Variables faltantes: ${missingKeys || 'N/A'}. ` +
      'Se utilizarán datos mock hasta que se configure el entorno.'
  );
}
