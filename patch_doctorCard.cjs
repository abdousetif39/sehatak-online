const fs = require('fs');
let content = fs.readFileSync('src/pages/public/DoctorCard.tsx', 'utf8');

content = content.replace(
  "import { getDoctorFullName, getDoctorSpecialty, getDoctorClinicName } from '../../utils/doctorUtils';",
  "import { getDoctorFullName, getDoctorSpecialty, getDoctorClinicName, formatWorkingDays } from '../../utils/doctorUtils';"
);

// Phone number formatting
content = content.replace(
  /<div className="flex items-center gap-1\.5 text-sm text-slate-500 font-medium" dir="ltr">\s*<Phone className="w-4 h-4 shrink-0 text-blue-500" \/>\s*<span>\{doctor\.phone\}<\/span>\s*<\/div>/g,
  \`<div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
            <Phone className="w-4 h-4 shrink-0 text-blue-500" />
            <span dir="ltr" className="text-left whitespace-nowrap">{doctor.phone}</span>
          </div>\`
);

// Working days formatting
content = content.replace(
  /<span>\{doctor\.workingDays\.map\(d => t\(\`day_\$\{d\}\`\)\)\.join\('، '\)\}<\/span>/g,
  "<span>{formatWorkingDays(doctor.workingDays, t)}</span>"
);

fs.writeFileSync('src/pages/public/DoctorCard.tsx', content);
console.log("Patched DoctorCard.tsx");
