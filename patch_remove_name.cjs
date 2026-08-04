const fs = require('fs');

let docManager = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');
docManager = docManager.replace(/name: firstNameAr \+ ' ' \+ lastNameAr,\s+/g, '');
fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', docManager);

let docSettings = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');
docSettings = docSettings.replace(/if \(formData\.firstNameAr && formData\.lastNameAr\) {\s+formData\.name = formData\.firstNameAr \+ ' ' \+ formData\.lastNameAr;\s+}\s+/g, '');
fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', docSettings);
