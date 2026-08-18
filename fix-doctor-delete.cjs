const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

const regex = /try\s*\{\s*console\.log\("Delete ID:", id\);[\s\S]*?await fetchData\(\);/s;

const replacement = `try {
      console.log("Delete ID:", id);
      console.log("Firestore path:", COLLECTIONS.USERS, id);
      
      // Fetch receptionists (filter in memory to avoid composite index)
      const qRec = query(collection(db, COLLECTIONS.USERS), where('doctorId', '==', id));
      const snapRec = await getDocs(qRec);

      // Fetch appointments
      const qApp = query(collection(db, COLLECTIONS.APPOINTMENTS), where('doctorId', '==', id));
      const snapApp = await getDocs(qApp);

      // Fetch public slots
      const qSlots = query(collection(db, COLLECTIONS.PUBLIC_SLOTS), where('doctorId', '==', id));
      const snapSlots = await getDocs(qSlots);

      const batch = writeBatch(db);
      
      // Delete the doctor documents
      batch.delete(doc(db, COLLECTIONS.USERS, id));
      batch.delete(doc(db, COLLECTIONS.DOCTORS, id));

      // Cascade delete: receptionists
      snapRec.docs.forEach(d => {
        if (d.data().role === 'receptionist') batch.delete(d.ref);
      });

      // Cascade delete: appointments
      snapApp.docs.forEach(d => batch.delete(d.ref));

      // Cascade delete: public slots
      snapSlots.docs.forEach(d => batch.delete(d.ref));

      // Limit check: In a real app we'd chunk this if > 500 operations.
      // For this MVP, we commit everything in one batch.
      await batch.commit();

      await fetchData();`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', code);
