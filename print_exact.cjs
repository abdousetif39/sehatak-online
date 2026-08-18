const fs = require('fs');
let content = fs.readFileSync('src/pages/doctor/Calendar.tsx', 'utf8');
const p1 = content.indexOf('{days.map((day)');
const endMatch = content.match(/\{\s*t\("appointments"\)\s*\}.*?<\/button>\s*\}\)\}\s*<\/div>\s*<\/div>/s);
if (endMatch) {
  console.log("Matched regex!");
  const p2 = endMatch.index;
  const matchLen = endMatch[0].length;
  console.log(p2, matchLen);
} else {
  console.log("Regex failed.");
}
