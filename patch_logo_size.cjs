const fs = require('fs');

const patchFile = (file, oldClass, newClass) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(oldClass, newClass);
  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}

patchFile('src/pages/Auth.tsx', 'className="h-20 w-auto object-contain"', 'className="h-24 w-auto object-contain"');
patchFile('src/pages/Public.tsx', 'className="h-10 w-auto object-contain"', 'className="h-12 w-auto object-contain"');
patchFile('src/pages/Doctor.tsx', 'className="h-10 w-auto object-contain"', 'className="h-12 w-auto object-contain"');
patchFile('src/pages/Admin.tsx', 'className="h-10 w-auto object-contain"', 'className="h-12 w-auto object-contain"');
