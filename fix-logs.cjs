const fs = require('fs');

function injectLog(file, searchStr, logStr) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes(logStr)) {
    code = code.replace(searchStr, logStr + '\n' + searchStr);
    fs.writeFileSync(file, code);
  }
}

injectLog('src/pages/doctor/StaffManager.tsx', 
  'await deleteDoc(doc(db, COLLECTIONS.USERS, id));', 
  '        console.log("Delete ID:", id);\n        console.log("Firestore path:", COLLECTIONS.USERS, id);'
);

injectLog('src/pages/admin/DoctorsManager.tsx', 
  'await deleteDoc(doc(db, COLLECTIONS.USERS, id));', 
  '        console.log("Delete ID:", id);\n        console.log("Firestore path:", COLLECTIONS.USERS, id);'
);

injectLog('src/pages/admin/ReceptionistsManager.tsx', 
  'await deleteDoc(doc(db, COLLECTIONS.USERS, id));', 
  '        console.log("Delete ID:", id);\n        console.log("Firestore path:", COLLECTIONS.USERS, id);'
);

injectLog('src/pages/admin/AppointmentsViewer.tsx', 
  'const batch = writeBatch(db);', 
  '        console.log("Delete ID:", id);\n        console.log("Firestore path:", COLLECTIONS.APPOINTMENTS, id);'
);

injectLog('src/pages/doctor/DoctorDashboardHome.tsx', 
  'const batch = writeBatch(db);', 
  '        console.log("Delete ID:", id);\n        console.log("Firestore path:", COLLECTIONS.APPOINTMENTS, id);'
);

