const fs = require('fs');
let code = fs.readFileSync('src/pages/public/DoctorCard.tsx', 'utf8');
code = code.replace(/import \{ db \} from '\.\.\/\.\.\/lib\/firebase';/, "import { db } from '../../lib/firebase';\nimport { COLLECTIONS } from '../../lib/constants';");
code = code.replace(/'public_slots'/g, 'COLLECTIONS.PUBLIC_SLOTS');
fs.writeFileSync('src/pages/public/DoctorCard.tsx', code);
