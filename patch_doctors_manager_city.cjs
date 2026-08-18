const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

content = content.replace(
  "import { getStateName, getCities, getCityName, getStateByName } from '../../utils/locationUtils';",
  "import { getStateName, getCities, getCityName, getStateByName, getCityArabicName } from '../../utils/locationUtils';"
);

const oldCityValueBlock = `value={
                  (() => {
                    if (!city) return '';
                    const cities = getCities(stateName);
                    const found = cities.find(c => c.ar === city || c.fr === city);
                    return found ? found.ar : city;
                  })()
                }`;

const newCityValueBlock = `value={getCityArabicName(city, stateName)}`;

content = content.replace(oldCityValueBlock, newCityValueBlock);
fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', content);
console.log("Patched DoctorsManager.tsx");
