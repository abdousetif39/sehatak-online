const fs = require('fs');

let ar = JSON.parse(fs.readFileSync('src/locales/ar.json', 'utf8'));
ar['success'] = 'نجاح';
ar['error'] = 'خطأ';
fs.writeFileSync('src/locales/ar.json', JSON.stringify(ar, null, 2));

let fr = JSON.parse(fs.readFileSync('src/locales/fr.json', 'utf8'));
fr['success'] = 'Succès';
fr['error'] = 'Erreur';
fs.writeFileSync('src/locales/fr.json', JSON.stringify(fr, null, 2));
