const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AppointmentsViewer.tsx', 'utf8');

content = content.replace(
  "const { t } = useTranslation();",
  "const { t, i18n } = useTranslation();\n  const { getDoctorFullName } = require('../../utils/doctorUtils');"
);

content = content.replace(
  "docSnap.docs.forEach(d => doctorsMap.set(d.id, (d.data()).name));",
  "docSnap.docs.forEach(d => doctorsMap.set(d.id, getDoctorFullName(d.data() as any, i18n.language)));"
);

content = content.replace(
  "const { getDoctorFullName } = require('../../utils/doctorUtils');",
  ""
);

content = content.replace(
  "import { useTranslation } from 'react-i18next';",
  "import { useTranslation } from 'react-i18next';\nimport { getDoctorFullName } from '../../utils/doctorUtils';"
);

fs.writeFileSync('src/pages/admin/AppointmentsViewer.tsx', content);
