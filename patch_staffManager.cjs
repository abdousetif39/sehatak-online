const fs = require('fs');
let content = fs.readFileSync('src/pages/doctor/StaffManager.tsx', 'utf8');

// Update StaffModal state
content = content.replace(
  /const \[email, setEmail\] = useState\(''\);/,
  "const [firstName, setFirstName] = useState('');\n  const [lastName, setLastName] = useState('');\n  const [email, setEmail] = useState('');"
);

// Update StaffModal save logic
content = content.replace(
  /const newUser: User = \{\s*id: uid,\s*email,\s*role: 'receptionist',\s*doctorId\s*\};/,
  \`const newUser: User = {
        id: uid,
        email,
        role: 'receptionist',
        doctorId,
        firstName,
        lastName,
        receptionistName: \`\${firstName} \${lastName}\`.trim()
      };\`
);

// Update StaffModal form fields
content = content.replace(
  /<div className="space-y-4">/,
  \`<div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('first_name')}</label>
                <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('last_name')}</label>
                <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" />
              </div>
            </div>\`
);

// Update StaffManager list header
content = content.replace(
  /<div className="flex-1">\{t\('email'\)\}<\/div>/,
  \`<div className="flex-1">{t('name')}</div>
            <div className="flex-1">{t('email')}</div>\`
);

// Update StaffManager list display
content = content.replace(
  /<div className="flex-1 font-medium text-slate-700">\{member\.email\}<\/div>/,
  \`<div className="flex-1 font-bold text-slate-900">
                  {member.firstName && member.lastName ? \`\${member.firstName} \${member.lastName}\` : member.receptionistName || member.email}
                </div>
                <div className="flex-1 text-sm text-slate-500" dir="ltr">{member.email}</div>\`
);

fs.writeFileSync('src/pages/doctor/StaffManager.tsx', content);
console.log("Patched StaffManager.tsx");
