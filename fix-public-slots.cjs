const fs = require('fs');
let code = fs.readFileSync('src/pages/public/DoctorProfile.tsx', 'utf8');
code = code.replace(/'public_slots'/g, 'COLLECTIONS.PUBLIC_SLOTS');
fs.writeFileSync('src/pages/public/DoctorProfile.tsx', code);
