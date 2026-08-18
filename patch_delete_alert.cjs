const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');
content = content.replace(/alert\(`Delete failed: \$\{e\.message\}`\);/g, "alert(`${t('delete_failed')}: ${e.message}`);");
fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', content);
console.log("Patched delete failed alert");
