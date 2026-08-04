const fs = require('fs');

const filesToFix = [
  'src/pages/doctor/StaffManager.tsx',
  'src/pages/admin/DoctorsManager.tsx',
  'src/pages/admin/ReceptionistsManager.tsx',
  'src/pages/admin/AppointmentsViewer.tsx',
  'src/pages/doctor/DoctorDashboardHome.tsx',
  'src/pages/public/Home.tsx',
  'src/pages/doctor/DoctorSettings.tsx',
  'src/pages/doctor/PatientsSearch.tsx'
];

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  
  // carefully replace map functions
  code = code.replace(/snap\.docs\.map\(d => d\.data\(\) as ([a-zA-Z]+)\)/g, "snap.docs.map(d => ({ ...d.data(), id: d.id } as $1))");
  code = code.replace(/docsSnap\.docs\.map\(doc => doc\.data\(\) as ([a-zA-Z]+)\)/g, "docsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as $1))");
  code = code.replace(/usersSnap\.docs\.map\(doc => doc\.data\(\)\)/g, "usersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }))");
  code = code.replace(/appSnap\.docs\.map\(d => d\.data\(\)\)/g, "appSnap.docs.map(d => ({ ...d.data(), id: d.id }))");
  code = code.replace(/d\.data\(\) as any/g, "({ ...d.data(), id: d.id } as any)");

  fs.writeFileSync(file, code);
});
