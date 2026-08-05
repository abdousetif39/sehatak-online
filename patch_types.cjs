const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  /export interface User \{\s*id: string;\s*email: string;\s*role: Role;\s*doctorId\?: string;\s*\}/,
  \`export interface User {
  id: string;
  email: string;
  role: Role;
  doctorId?: string;
  firstName?: string;
  lastName?: string;
  receptionistName?: string;
  phone?: string;
}\`
);
fs.writeFileSync('src/types.ts', content);
console.log("Patched types.ts");
