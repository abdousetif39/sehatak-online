const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

const regex = /await deleteDoc\(doc\(db, COLLECTIONS\.USERS, id\)\);\n\s*await deleteDoc\(doc\(db, COLLECTIONS\.DOCTORS, id\)\);/;

const replacement = `await deleteDoc(doc(db, COLLECTIONS.USERS, id));
      await deleteDoc(doc(db, COLLECTIONS.DOCTORS, id));
      
      // Cascade delete: receptionists
      const qRec = query(collection(db, COLLECTIONS.USERS), where('doctorId', '==', id), where('role', '==', 'receptionist'));
      const snapRec = await getDocs(qRec);
      for (const d of snapRec.docs) {
        await deleteDoc(doc(db, COLLECTIONS.USERS, d.id));
      }

      // Cascade delete: appointments
      const qApp = query(collection(db, COLLECTIONS.APPOINTMENTS), where('doctorId', '==', id));
      const snapApp = await getDocs(qApp);
      const batchApp = writeBatch(db);
      snapApp.docs.forEach(d => batchApp.delete(d.ref));
      if (snapApp.docs.length > 0) await batchApp.commit();

      // Cascade delete: public slots
      const qSlots = query(collection(db, COLLECTIONS.PUBLIC_SLOTS), where('doctorId', '==', id));
      const snapSlots = await getDocs(qSlots);
      const batchSlots = writeBatch(db);
      snapSlots.docs.forEach(d => batchSlots.delete(d.ref));
      if (snapSlots.docs.length > 0) await batchSlots.commit();`;

code = code.replace(regex, replacement);

if (!code.includes('query')) {
  code = code.replace(/import \{ collection, getDocs, doc, setDoc, deleteDoc, updateDoc \} from 'firebase\/firestore';/, "import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where, writeBatch } from 'firebase/firestore';");
} else if (!code.includes('writeBatch')) {
  code = code.replace(/import \{ collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where \} from 'firebase\/firestore';/, "import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where, writeBatch } from 'firebase/firestore';");
} else if (!code.includes('where')) {
  code = code.replace(/import \{ collection, getDocs, doc, setDoc, deleteDoc, updateDoc \} from 'firebase\/firestore';/, "import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where, writeBatch } from 'firebase/firestore';");
}

fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', code);
