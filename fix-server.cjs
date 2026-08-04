const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /import \* as admin from 'firebase-admin';/g;

const replacement = `import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';`;

code = code.replace(regex, replacement);

code = code.replace(/!admin\.apps\.length/g, '!getApps().length');
code = code.replace(/admin\.initializeApp\(\{\n\s*credential: admin\.credential\.cert/g, 'initializeApp({\n      credential: cert');
code = code.replace(/admin\.auth\(\)/g, 'getAuth()');
code = code.replace(/admin\.firestore\(\)/g, 'getFirestore()');

fs.writeFileSync('server.ts', code);
