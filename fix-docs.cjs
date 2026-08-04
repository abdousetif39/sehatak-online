const fs = require('fs');
let file = 'src/pages/admin/DoctorsManager.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/docsSnap\.docs\.map\(doc => \(doc\.data\(\) as Doctor\)\);/g, "docsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Doctor));");
code = code.replace(/usersSnap\.docs\.map\(doc => \(doc\.data\(\)\)\);/g, "usersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));");
fs.writeFileSync(file, code);

file = 'src/pages/admin/ReceptionistsManager.tsx';
code = fs.readFileSync(file, 'utf8');
code = code.replace(/docsSnap\.docs\.map\(doc => \(doc\.data\(\) as Doctor\)\);/g, "docsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Doctor));");
code = code.replace(/usersSnap\.docs\.map\(doc => \(doc\.data\(\)\)\);/g, "usersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));");
fs.writeFileSync(file, code);
