const fs = require('fs');
let content = fs.readFileSync('src/pages/doctor/Calendar.tsx', 'utf8');
const p1 = content.indexOf('{days.map((day)');
console.log(content.substring(p1 + 1150, p1 + 1400));
