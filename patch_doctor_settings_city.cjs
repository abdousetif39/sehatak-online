const fs = require('fs');
let content = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');

content = content.replace(
  "import { getStateName, getCities, getCityName } from '../../utils/locationUtils';",
  "import { getStateName, getCities, getCityName, getCityArabicName } from '../../utils/locationUtils';"
);

const oldCityValueBlock = `value={
                  (() => {
                    if (!formData.city) return '';
                    const cities = getCities(formData.state);
                    const found = cities.find(c => c.ar === formData.city || c.fr === formData.city);
                    return found ? found.ar : formData.city;
                  })()
                }`;

const newCityValueBlock = `value={getCityArabicName(formData.city, formData.state)}`;

content = content.replace(oldCityValueBlock, newCityValueBlock);
fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', content);
console.log("Patched DoctorSettings.tsx");
