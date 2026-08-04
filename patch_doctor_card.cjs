const fs = require('fs');
let content = fs.readFileSync('src/pages/public/DoctorCard.tsx', 'utf8');

content = content.replace(
  'import { MapPin, Stethoscope, Calendar as CalendarIcon, Clock } from \'lucide-react\';',
  'import { MapPin, Stethoscope, Calendar as CalendarIcon, Clock, Phone } from \'lucide-react\';'
);

const oldLocationBlock = `      <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl">
        <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
        <span className="truncate">{getStateName(doctor.state, i18n.language)} - {getCityName(doctor.state, doctor.city, i18n.language)} - {doctor.address}</span>
      </div>`;

const newLocationBlock = `      <div className="flex flex-col gap-2 mb-4 bg-slate-50 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
          <span className="truncate">{getStateName(doctor.state, i18n.language)} - {getCityName(doctor.state, doctor.city, i18n.language)} - {doctor.address}</span>
        </div>
        {doctor.showPhoneInCard && doctor.phone && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium" dir="ltr">
            <Phone className="w-4 h-4 shrink-0 text-blue-500" />
            <span>{doctor.phone}</span>
          </div>
        )}
      </div>`;

content = content.replace(oldLocationBlock, newLocationBlock);
fs.writeFileSync('src/pages/public/DoctorCard.tsx', content);
console.log("Patched DoctorCard.tsx");
