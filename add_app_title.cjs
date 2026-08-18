const fs = require('fs');

const arLocales = JSON.parse(fs.readFileSync('src/locales/ar.json', 'utf8'));
const frLocales = JSON.parse(fs.readFileSync('src/locales/fr.json', 'utf8'));

arLocales['app_title'] = "صحتك أونلاين";
frLocales['app_title'] = "Sehatak Online";

fs.writeFileSync('src/locales/ar.json', JSON.stringify(arLocales, null, 2) + '\n');
fs.writeFileSync('src/locales/fr.json', JSON.stringify(frLocales, null, 2) + '\n');
console.log("Added app_title");
