const fs = require('fs');
let content = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');

const importRegex = /import \{\s*getStateName,\s*getCities,\s*getCityName,\s*getStateByName,?\s*\} from "\.\.\/\.\.\/utils\/locationUtils";/m;
const newImport = `import {
  getStateName,
  getCities,
  getCityName,
  getStateByName,
  getCityArabicName
} from "../../utils/locationUtils";`;

if (content.match(importRegex)) {
   content = content.replace(importRegex, newImport);
} else {
   // Try with single quotes or different format
   const importRegex2 = /import \{\s*getStateName,\s*getCities,\s*getCityName\s*\} from ['"]\.\.\/\.\.\/utils\/locationUtils['"];/m;
   if (content.match(importRegex2)) {
      content = content.replace(importRegex2, `import { getStateName, getCities, getCityName, getCityArabicName } from '../../utils/locationUtils';`);
   }
}

fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', content);
