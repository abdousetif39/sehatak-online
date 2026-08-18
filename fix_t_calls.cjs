const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist') && !file.includes('locales')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');

let arKeys = {};
let frKeys = {};

// We look for t('key', 'fallback') or t("key", "fallback")
// The fallback might have arabic or french chars.

const tRegex = /t\(\s*(['"])([^'"]+)\1\s*,\s*(['"])([^'"]+)\3\s*\)/g;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  content = content.replace(tRegex, (match, q1, key, q3, fallback) => {
    if (fallback) {
      if (/[\u0600-\u06FF]/.test(fallback)) {
        arKeys[key] = fallback;
      } else {
        frKeys[key] = fallback;
      }
      changed = true;
      return `t('${key}')`;
    }
    return match;
  });
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});

fs.writeFileSync('extracted_ar.json', JSON.stringify(arKeys, null, 2));
fs.writeFileSync('extracted_fr.json', JSON.stringify(frKeys, null, 2));
console.log('Done extracting.');
