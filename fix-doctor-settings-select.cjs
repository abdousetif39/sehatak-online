const fs = require('fs');
let code = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');

code = code.replace(/const \{ t \} = useTranslation\(\);/g, 'const { t, i18n } = useTranslation();');

// Fix getStates().map
const oldStateMap = `{getStates().map(s => (
                  <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
                ))}`;
const newStateMap = `{getStates(i18n.language).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}`;
code = code.replace(oldStateMap, newStateMap);

// Fix getCitiesForState
const oldCityMap = `{formData.state && getCitiesForState(Number(formData.state)).map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}`;
const newCityMap = `{formData.state && getCitiesForState(formData.state, i18n.language).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}`;
code = code.replace(oldCityMap, newCityMap);

fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', code);
