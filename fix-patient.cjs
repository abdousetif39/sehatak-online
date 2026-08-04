const fs = require('fs');
let code = fs.readFileSync('src/pages/doctor/PatientsSearch.tsx', 'utf8');
code = code.replace(/import \{ db \} from '\.\.\/\.\.\/lib\/firebase';/, "import { db } from '../../lib/firebase';\nimport { COLLECTIONS } from '../../lib/constants';");
code = code.replace(/'appointments'/g, 'COLLECTIONS.APPOINTMENTS');
fs.writeFileSync('src/pages/doctor/PatientsSearch.tsx', code);
