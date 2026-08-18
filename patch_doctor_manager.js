const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

// Replace standard "name" usage with the bilingual fields.
content = content.replace(
  "const [name, setName] = useState(user?.name || '');",
  `const [firstNameAr, setFirstNameAr] = useState(user?.firstNameAr || '');
  const [lastNameAr, setLastNameAr] = useState(user?.lastNameAr || '');
  const [firstNameFr, setFirstNameFr] = useState(user?.firstNameFr || '');
  const [lastNameFr, setLastNameFr] = useState(user?.lastNameFr || '');`
);

content = content.replace(
  "const [specialty, setSpecialty] = useState(user?.specialty || '');",
  `const [specialtyAr, setSpecialtyAr] = useState(user?.specialtyAr || '');
  const [specialtyFr, setSpecialtyFr] = useState(user?.specialtyFr || '');
  const [clinicNameAr, setClinicNameAr] = useState(user?.clinicNameAr || '');
  const [clinicNameFr, setClinicNameFr] = useState(user?.clinicNameFr || '');`
);

content = content.replace(
  "name,",
  `name: firstNameAr + ' ' + lastNameAr, // keep for backward compatibility
          firstNameAr, lastNameAr, firstNameFr, lastNameFr,
          specialty: specialtyAr, // keep for backward compatibility
          specialtyAr, specialtyFr,
          clinicName: clinicNameAr,
          clinicNameAr, clinicNameFr,`
);

content = content.replace(
  "name,\n          specialty,",
  `name: firstNameAr + ' ' + lastNameAr,
          firstNameAr, lastNameAr, firstNameFr, lastNameFr,
          specialty: specialtyAr,
          specialtyAr, specialtyFr,
          clinicName: clinicNameAr,
          clinicNameAr, clinicNameFr,`
);

content = content.replace(
  "<div>\n            <label className=\"block text-sm font-medium text-slate-700 mb-1\">{t('doctor_full_name')}</label>\n            <input required type=\"text\" value={name} onChange={e => setName(e.target.value)} className=\"w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none\" />\n          </div>",
  `<div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('first_name_ar', 'الاسم (عربي)')}</label>
              <input required type="text" value={firstNameAr} onChange={e => setFirstNameAr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('last_name_ar', 'اللقب (عربي)')}</label>
              <input required type="text" value={lastNameAr} onChange={e => setLastNameAr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="rtl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('first_name_fr', 'الاسم (فرنسي)')}</label>
              <input required type="text" value={firstNameFr} onChange={e => setFirstNameFr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('last_name_fr', 'اللقب (فرنسي)')}</label>
              <input required type="text" value={lastNameFr} onChange={e => setLastNameFr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="ltr" />
            </div>
          </div>`
);

content = content.replace(
  "<div>\n            <label className=\"block text-sm font-medium text-slate-700 mb-1\">{t('specialty')}</label>\n            <input required type=\"text\" value={specialty} onChange={e => setSpecialty(e.target.value)} className=\"w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none\" />\n          </div>",
  `<div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('specialty_ar', 'الاختصاص (عربي)')}</label>
              <input required type="text" value={specialtyAr} onChange={e => setSpecialtyAr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('specialty_fr', 'الاختصاص (فرنسي)')}</label>
              <input required type="text" value={specialtyFr} onChange={e => setSpecialtyFr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="ltr" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('clinic_name_ar', 'اسم العيادة (عربي)')}</label>
              <input type="text" value={clinicNameAr} onChange={e => setClinicNameAr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('clinic_name_fr', 'اسم العيادة (فرنسي)')}</label>
              <input type="text" value={clinicNameFr} onChange={e => setClinicNameFr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="ltr" />
            </div>
          </div>`
);

// We also need to fix where `u.name` and `u.specialty` are displayed in the list
content = content.replace(
  "import { useTranslation } from 'react-i18next';",
  "import { useTranslation } from 'react-i18next';\nimport { getDoctorFullName, getDoctorSpecialty } from '../../utils/doctorUtils';"
)

content = content.replace(
  "<div className=\"font-bold text-slate-900\">{u.name}</div>",
  `<div className="font-bold text-slate-900">{getDoctorFullName(u as any, i18n.language)}</div>`
);

content = content.replace(
  "<div className=\"text-xs text-slate-500\">{u.specialty}</div>",
  `<div className="text-xs text-slate-500">{getDoctorSpecialty(u as any, i18n.language)}</div>`
);

fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', content);
