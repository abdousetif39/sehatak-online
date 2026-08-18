const fs = require('fs');
let file = 'src/pages/doctor/DoctorDashboardHome.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/snap\.docs\.map\(d => \(d\.data\(\) as Appointment\)\)/g, "snap.docs.map(d => ({ ...d.data(), id: d.id } as Appointment))");
fs.writeFileSync(file, code);

file = 'src/pages/public/Home.tsx';
code = fs.readFileSync(file, 'utf8');
code = code.replace(/snap\.docs\.map\(d => \(d\.data\(\) as Doctor\)\)/g, "snap.docs.map(d => ({ ...d.data(), id: d.id } as Doctor))");
fs.writeFileSync(file, code);
