const fs = require('fs');
let content = fs.readFileSync('src/pages/public/DoctorCard.tsx', 'utf8');

content = content.replace(
  /\{\/\* Phone \*\/\}\s*\{doctor\.phone && \(\s*<div className="flex items-center gap-1\.5 text-sm text-slate-500 font-medium">\s*<Phone className="w-4 h-4 shrink-0 text-blue-500" \/>\s*<span dir="ltr" className="text-left whitespace-nowrap">\{doctor\.phone\}<\/span>\s*<\/div>\s*\)\}/,
  \`{/* Phone */}
        {doctor.showPhoneInCard && doctor.phone && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
            <Phone className="w-4 h-4 shrink-0 text-blue-500" />
            <span dir="ltr" className="whitespace-nowrap">{doctor.phone}</span>
          </div>
        )}\`
);

content = content.replace(
  /<div className="flex flex-col">/g,
  '<div className="flex flex-col items-start">'
);

fs.writeFileSync('src/pages/public/DoctorCard.tsx', content);
console.log("Patched DoctorCard.tsx");
