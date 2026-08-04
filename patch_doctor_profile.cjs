const fs = require('fs');
let content = fs.readFileSync('src/pages/public/DoctorProfile.tsx', 'utf8');

// Add Phone import if not there
if (!content.includes('Phone,') && !content.includes(', Phone') && !content.includes(' Phone }')) {
  content = content.replace(
    'import { MapPin, Stethoscope, Calendar as CalendarIcon, Clock, CheckCircle2, Map as MapIcon, Navigation, Users } from \'lucide-react\';',
    'import { MapPin, Stethoscope, Calendar as CalendarIcon, Clock, CheckCircle2, Map as MapIcon, Navigation, Users, Phone } from \'lucide-react\';'
  );
}

const oldAddressBlock = `            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-start gap-3 text-slate-600 text-sm mb-4">
                <MapPin className="w-5 h-5 shrink-0 text-slate-400" />
                <span>{doctor.address}</span>
              </div>`;

const newAddressBlock = `            <div className="space-y-4 pt-6 border-t border-slate-100">
              {doctor.showPhoneInCard && doctor.phone && (
                <div className="flex items-start gap-3 text-slate-600 text-sm mb-4 font-medium" dir="ltr">
                  <Phone className="w-5 h-5 shrink-0 text-blue-500" />
                  <span>{doctor.phone}</span>
                </div>
              )}
              <div className="flex items-start gap-3 text-slate-600 text-sm mb-4">
                <MapPin className="w-5 h-5 shrink-0 text-slate-400" />
                <span>{doctor.address}</span>
              </div>`;

content = content.replace(oldAddressBlock, newAddressBlock);
fs.writeFileSync('src/pages/public/DoctorProfile.tsx', content);
console.log("Patched DoctorProfile.tsx");
