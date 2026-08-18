const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The App component already has `const { i18n } = useTranslation();` but needs `t`
content = content.replace('const { i18n } = useTranslation();', 'const { t, i18n } = useTranslation();');
content = content.replace('document.title = isAr ? "صحتك أونلاين" : "Sehatak Online";', "document.title = t('app_title');");

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx");
