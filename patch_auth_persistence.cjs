const fs = require('fs');
const content = `import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use initializeAuth with browserLocalPersistence to avoid Safari IndexedDB issues
export const auth = getApps().length === 0 
  ? initializeAuth(app, { persistence: browserLocalPersistence })
  : getAuth(app);

export const db = getApps().length === 0 
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const secondaryApp = getApps().find(a => a.name === 'Secondary') 
  ? getApp('Secondary') 
  : initializeApp(firebaseConfig, 'Secondary');
export const secondaryAuth = getAuth(secondaryApp);
`;

fs.writeFileSync('src/lib/firebase.ts', content);
console.log("Patched firebase.ts for Auth persistence");
