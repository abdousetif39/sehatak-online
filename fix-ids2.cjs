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
  
  // Revert bad replacements
  code = code.replace(/\{ \.\.\.\(\{ \.\.\.doc\.data\(\), id: doc\.id \}\), id: doc\.id \}/g, "doc.data()");
  code = code.replace(/\{ \.\.\.\(\{ \.\.\.d\.data\(\), id: d\.id \}\), id: d\.id \}/g, "d.data()");
  
  code = code.replace(/\{ \.\.\.doc\.data\(\), id: doc\.id \}/g, "doc.data()");
  code = code.replace(/\{ \.\.\.d\.data\(\), id: d\.id \}/g, "d.data()");
  
  // Re-apply safely
  // We want to replace exactly `d.data() as Type` with `({ ...d.data(), id: d.id } as Type)`
  // But wait, what if `d.data()` has `id: d.id` already appended?
  fs.writeFileSync(file, code);
});
