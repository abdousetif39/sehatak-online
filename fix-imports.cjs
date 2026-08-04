const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

code = code.replace(/import \{ collection, getDocs, doc, setDoc, deleteDoc, updateDoc \} from 'firebase\/firestore';/, "import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where, writeBatch } from 'firebase/firestore';");

fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', code);
