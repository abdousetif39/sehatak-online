const fs = require('fs');

let content = fs.readFileSync('src/pages/doctor/Calendar.tsx', 'utf8');
content = content.replace(/doctorName: doctor\.name \|\| doctor\.firstNameAr \+ ' ' \+ doctor\.lastNameAr \|\| "الطبيب"/g, 'doctorName: doctor.name || (doctor.firstNameAr ? doctor.firstNameAr + \' \' + doctor.lastNameAr : t(\'unknown_doctor\'))');
fs.writeFileSync('src/pages/doctor/Calendar.tsx', content);
console.log("Patched Calendar.tsx");
