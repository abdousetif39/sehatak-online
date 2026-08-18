const fs = require('fs');
const path = require('path');

const keys = new Set();
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const regex = /[^a-zA-Z0-9_$]t\(\s*['"`]([^'"`\$]+)['"`]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        keys.add(match[1]);
      }
    }
  }
}
walk('src');

const arKeys = Object.keys(JSON.parse(fs.readFileSync('src/locales/ar.json')));
const frKeys = Object.keys(JSON.parse(fs.readFileSync('src/locales/fr.json')));

const arMissing = [...keys].filter(k => !arKeys.includes(k));
const frMissing = [...keys].filter(k => !frKeys.includes(k));

console.log("AR missing:", arMissing);
console.log("FR missing:", frMissing);

const arUnused = arKeys.filter(k => !keys.has(k) && !k.startsWith('day_') && !k.startsWith('status_') && !k.startsWith('specialty_') && !k.startsWith('step_') && !k.startsWith('menu_') && k !== 'dr_prefix' && k !== 'app_name');
const frUnused = frKeys.filter(k => !keys.has(k) && !k.startsWith('day_') && !k.startsWith('status_') && !k.startsWith('specialty_') && !k.startsWith('step_') && !k.startsWith('menu_') && k !== 'dr_prefix' && k !== 'app_name');

// Instead of unused, let's just make sure both have the same keys and we add missing ones.
