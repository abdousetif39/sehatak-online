const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace the catch block console.errors
  code = code.replace(/catch\s*\((err|e):\s*any\)\s*\{\s*console\.error\(\1\);/g, 
  `catch ($1: any) {
      if ($1.code !== 'auth/email-already-in-use') {
        console.error($1);
      }`);

  fs.writeFileSync(file, code);
}

fixFile('src/pages/admin/DoctorsManager.tsx');
fixFile('src/pages/admin/ReceptionistsManager.tsx');
fixFile('src/pages/doctor/StaffManager.tsx');

