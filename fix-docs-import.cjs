const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

// Remove import from bottom
code = code.replace(/import ConfirmDeleteModal from '\.\.\/\.\.\/components\/ConfirmDeleteModal';/, '');

// Add to top if not there
if (!code.includes('import ConfirmDeleteModal from')) {
  code = code.replace(/import \{ COLLECTIONS, ROLES \} from '\.\.\/\.\.\/lib\/constants';/, "import { COLLECTIONS, ROLES } from '../../lib/constants';\nimport ConfirmDeleteModal from '../../components/ConfirmDeleteModal';");
}

fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', code);
