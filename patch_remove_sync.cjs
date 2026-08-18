const fs = require('fs');

let docSettings = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');
docSettings = docSettings.replace(/if \(formData\.specialtyAr\) formData\.specialty = formData\.specialtyAr;\s+/g, '');
docSettings = docSettings.replace(/if \(formData\.clinicNameAr\) formData\.clinicName = formData\.clinicNameAr;\s+/g, '');
fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', docSettings);
