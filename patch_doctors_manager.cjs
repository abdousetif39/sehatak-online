const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

// 1. Replace imports
content = content.replace(
  "import { getStates, getCitiesForState } from '../../data/algeria';",
  "import { WILAYAS } from '../../data/algeria-data';\nimport { getStateName, getCities, getCityName, getStateByName } from '../../utils/locationUtils';"
);

// 2. Remove ALGERIA_STATES from inside UserModal
content = content.replace(
  "const ALGERIA_STATES = getStates(i18n.language);",
  ""
);

// 3. Update stateName and city initialization
const initRegex = /const \[stateName, setStateName\] = useState\(user\?\.state \|\| ALGERIA_STATES\[0\]\);\n\s*const \[city, setCity\] = useState\(user\?\.city \|\| getCitiesForState\(ALGERIA_STATES\[0\], i18n\.language\)\[0\]\);/;
const initReplacement = `const [stateName, setStateName] = useState(user?.state || '16');
  const [city, setCity] = useState(user?.city || '');`;
content = content.replace(initRegex, initReplacement);

// 4. Update the useEffect for stateName changing
const effectRegex = /useEffect\(\(\) => \{\n\s*if \(\!user \|\| stateName \!\=\= user\?\.state\) \{\n\s*setCity\(getCitiesForState\(stateName, i18n\.language\)\[0\] \|\| \'\'\);\n\s*\}\n\s*\}, \[stateName, user, i18n\.language\]\);/;
// No need to setCity when state changes, or we just set it to ''
const effectReplacement = `useEffect(() => {
    if (!user || stateName !== user?.state) {
      setCity('');
    }
  }, [stateName, user]);`;
content = content.replace(effectRegex, effectReplacement);

// 5. Update JSX selects
const jsxStateRegex = /<select required value=\{stateName\} onChange=\{e => setStateName\(e\.target\.value\)\} className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-600 outline-none">\n\s*\{ALGERIA_STATES\.map\(s => <option key=\{s\} value=\{s\}>\{s\}<\/option>\)\}\n\s*<\/select>/;
const jsxStateReplacement = `<select required value={getStateByName(String(stateName))?.id || ''} onChange={e => setStateName(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-600 outline-none">
                <option value="">{t('select_state', 'اختر الولاية')}</option>
                {WILAYAS.map(w => (
                  <option key={w.id} value={w.id}>
                    {getStateName(w.id, i18n.language)}
                  </option>
                ))}
              </select>`;
content = content.replace(jsxStateRegex, jsxStateReplacement);

const jsxCityRegex = /<select required value=\{city\} onChange=\{e => setCity\(e\.target\.value\)\} className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-600 outline-none">\n\s*\{getCitiesForState\(stateName, i18n\.language\)\.map\(c => <option key=\{c\} value=\{c\}>\{c\}<\/option>\)\}\n\s*<\/select>/;
const jsxCityReplacement = `<select required value={
                  (() => {
                    if (!city) return '';
                    const cities = getCities(stateName);
                    const found = cities.find(c => c.ar === city || c.fr === city);
                    return found ? found.ar : city;
                  })()
                } onChange={e => setCity(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-600 outline-none" disabled={!stateName}>
                <option value="">{t('select_city', 'اختر البلدية')}</option>
                {stateName && getCities(stateName).map((c, index) => (
                    <option key={index} value={c.ar}>
                      {getCityName(stateName, c.ar, i18n.language)}
                    </option>
                ))}
              </select>`;
content = content.replace(jsxCityRegex, jsxCityReplacement);

fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', content);
console.log("Updated DoctorsManager.tsx");
