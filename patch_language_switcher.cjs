const fs = require('fs');

const filesToPatch = [
  'src/pages/Admin.tsx',
  'src/pages/Auth.tsx',
  'src/pages/Doctor.tsx',
  'src/pages/Public.tsx'
];

filesToPatch.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\{i18n\.language === 'ar' \? 'Français' \: 'العربية'\}/g, "{i18n.language === 'ar' ? t('language_fr') : t('language_ar')}");
  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
});
