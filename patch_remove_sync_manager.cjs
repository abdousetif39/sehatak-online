const fs = require('fs');
let docManager = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');
docManager = docManager.replace(/specialty: specialtyAr,\s+/g, '');
docManager = docManager.replace(/clinicName: clinicNameAr,\s+/g, '');
fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', docManager);
