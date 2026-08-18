const fs = require('fs');
let ar = JSON.parse(fs.readFileSync('src/locales/ar.json', 'utf8'));
if (!ar['first_name']) ar['first_name'] = 'الاسم';
if (!ar['last_name']) ar['last_name'] = 'اللقب';
fs.writeFileSync('src/locales/ar.json', JSON.stringify(ar, null, 2));

let fr = JSON.parse(fs.readFileSync('src/locales/fr.json', 'utf8'));
if (!fr['first_name']) fr['first_name'] = 'Prénom';
if (!fr['last_name']) fr['last_name'] = 'Nom';
fs.writeFileSync('src/locales/fr.json', JSON.stringify(fr, null, 2));
console.log("Patched locales");
