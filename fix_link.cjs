const fs = require('fs');

function fixLink(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    '<Link\n                key={item.path}\n                to={item.path}',
    '<Link\n                onClick={() => setIsSidebarOpen(false)}\n                key={item.path}\n                to={item.path}'
  );
  fs.writeFileSync(file, content);
}

fixLink('src/pages/Doctor.tsx');
fixLink('src/pages/Admin.tsx');
