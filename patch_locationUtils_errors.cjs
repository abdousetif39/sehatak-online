const fs = require('fs');
let content = fs.readFileSync('src/utils/locationUtils.ts', 'utf8');

content = content.replace(/ \|\| String\(c\.id\) === String\(city\)/g, '');
content = content.replace(/\|\|\\s*String\\(c\\.id\\) === String\\(city\\)/g, '');

fs.writeFileSync('src/utils/locationUtils.ts', content);
console.log("Patched locationUtils.ts errors");
