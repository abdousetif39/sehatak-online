const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/ReceptionistsManager.tsx', 'utf8');
content = content.replace("const { t } = useTranslation();", "const { t, i18n } = useTranslation();");
content = content.replace("const { t } = useTranslation();", "const { t, i18n } = useTranslation();");
fs.writeFileSync('src/pages/admin/ReceptionistsManager.tsx', content);
