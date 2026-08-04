const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

const regex = /catch\s*\((err|e):\s*any\)\s*\{\s*console\.error\(\1\);/;

const replacement = `catch ($1: any) {
      if ($1.code !== 'auth/invalid-credential' && $1.code !== 'auth/user-not-found' && $1.code !== 'auth/wrong-password') {
        console.error($1);
      }`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/Auth.tsx', code);
