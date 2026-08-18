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
  
  // Replace doc.data() inside maps to ensure id is document.id
  code = code.replace(/d\.data\(\)\sas\s([A-Za-z]+)/g, "({ ...d.data(), id: d.id } as $1)");
  code = code.replace(/doc\.data\(\)\sas\s([A-Za-z]+)/g, "({ ...doc.data(), id: doc.id } as $1)");
  code = code.replace(/doc\.data\(\)/g, "({ ...doc.data(), id: doc.id })");
  code = code.replace(/d\.data\(\)/g, "({ ...d.data(), id: d.id })");
  
  // Also we need to make sure delete operations log the ID.
  fs.writeFileSync(file, code);
});
