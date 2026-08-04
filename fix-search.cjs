const fs = require('fs');
let file = 'src/pages/doctor/PatientsSearch.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/snap\.docs\.map\(d => \(d\.data\(\) as Appointment\)\)/g, "snap.docs.map(d => ({ ...d.data(), id: d.id } as Appointment))");
code = code.replace(/recentSnap\.docs\.map\(d => \(d\.data\(\) as Appointment\)\)/g, "recentSnap.docs.map(d => ({ ...d.data(), id: d.id } as Appointment))");
fs.writeFileSync(file, code);
