const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  '  phone: string;',
  '  phone: string;\n  showPhoneInCard?: boolean;'
);

fs.writeFileSync('src/types.ts', content);
console.log("Patched types.ts");
