const fs = require('fs');
const arKeys = Object.keys(JSON.parse(fs.readFileSync('src/locales/ar.json')));
const frKeys = Object.keys(JSON.parse(fs.readFileSync('src/locales/fr.json')));

const arMissingInFr = arKeys.filter(k => !frKeys.includes(k));
const frMissingInAr = frKeys.filter(k => !arKeys.includes(k));

console.log("In AR but not FR:", arMissingInFr);
console.log("In FR but not AR:", frMissingInAr);
