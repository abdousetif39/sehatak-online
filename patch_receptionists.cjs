const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/ReceptionistsManager.tsx', 'utf8');

content = content.replace(
  "import { useTranslation } from 'react-i18next';",
  "import { useTranslation } from 'react-i18next';\nimport { getDoctorFullName } from '../../utils/doctorUtils';"
);

content = content.replace(
  "{doctorsList.find(d => d.id === u.doctorId)?.name || 'N/A'}",
  "{doctorsList.find(d => d.id === u.doctorId) ? getDoctorFullName(doctorsList.find(d => d.id === u.doctorId) as any, i18n.language) : 'N/A'}"
);

content = content.replace(
  "{doctors.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}",
  "{doctors.map((d: any) => <option key={d.id} value={d.id}>{getDoctorFullName(d, i18n.language)}</option>)}"
);

fs.writeFileSync('src/pages/admin/ReceptionistsManager.tsx', content);
