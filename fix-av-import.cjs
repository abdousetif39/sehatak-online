const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AppointmentsViewer.tsx', 'utf8');
code = "import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';\n" + code;
fs.writeFileSync('src/pages/admin/AppointmentsViewer.tsx', code);
