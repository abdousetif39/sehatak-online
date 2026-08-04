import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const isAlreadyInitialized = getApps().length > 0;
const app = isAlreadyInitialized ? getApp() : initializeApp(firebaseConfig);

// Use initializeAuth with browserLocalPersistence to avoid Safari IndexedDB issues
export const auth = !isAlreadyInitialized 
  ? initializeAuth(app, { persistence: browserLocalPersistence })
  : getAuth(app);

export const db = !isAlreadyInitialized 
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const secondaryApp = getApps().find(a => a.name === 'Secondary') 
  ? getApp('Secondary') 
  : initializeApp(firebaseConfig, 'Secondary');
export const secondaryAuth = getAuth(secondaryApp);
