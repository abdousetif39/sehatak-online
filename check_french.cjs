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
const frenchRegex = /[éàçèêâîôûëïüÿæœÉÀÇÈÊÂÎÔÛËÏÜŸÆŒ]/;
let remaining = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) return;
    if (frenchRegex.test(line)) {
      remaining.push(`Found French in ${file}:${index + 1} -> ${line.trim()}`);
    }
  });
});

console.log(remaining.filter(r => !r.includes('algeria-data.ts')).join('\n'));
