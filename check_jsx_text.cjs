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
const jsxTextRegex = />([^<{]+)</g;

let hardcoded = [];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = jsxTextRegex.exec(content)) !== null) {
    let text = match[1].trim();
    if (text.length > 2 && /[a-zA-Z]/.test(text)) {
      if (!text.includes('=>') && !text.includes('&&') && text !== 'OSM' && !text.includes('return') && !text.includes('const') && !text.includes('useState') && !text.includes('useEffect') && !text.includes('===') && !text.includes('...')) {
         hardcoded.push(`Found JSX text in ${file} -> "${text}"`);
      }
    }
  }
});
console.log(hardcoded.join('\n'));
