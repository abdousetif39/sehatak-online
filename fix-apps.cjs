const fs = require('fs');
let file = 'src/pages/admin/AppointmentsViewer.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/const data = \(d\.data\(\) as Appointment\);/g, "const data = ({ ...d.data(), id: d.id } as Appointment);");
fs.writeFileSync(file, code);

file = 'src/pages/doctor/StaffManager.tsx';
code = fs.readFileSync(file, 'utf8');
code = code.replace(/snap\.docs\.map\(d => d\.data\(\) as User\)/g, "snap.docs.map(d => ({ ...d.data(), id: d.id } as User))");
fs.writeFileSync(file, code);
