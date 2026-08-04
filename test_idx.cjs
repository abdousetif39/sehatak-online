const fs = require('fs');
let content = fs.readFileSync('src/pages/doctor/Calendar.tsx', 'utf8');

const m1 = content.indexOf('days.map((day)');
const endMatch = content.match(/\}\)\}\s*<\/div>\s*<\/div>/);
console.log(m1, endMatch ? endMatch.index : -1);
if (endMatch) {
  console.log(endMatch[0]);
}
