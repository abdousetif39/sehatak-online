const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboardHome.tsx', 'utf8');

if (!code.includes('import MessageModal')) {
    code = code.replace(
        "import { Doctor } from '../../types';",
        "import { Doctor } from '../../types';\nimport MessageModal from '../../components/MessageModal';"
    );
}

const stateToAdd = `
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });
`;

code = code.replace(
  "const [fixingSlugs, setFixingSlugs] = useState(false);",
  "const [fixingSlugs, setFixingSlugs] = useState(false);" + stateToAdd
);

code = code.replace(
  'alert(t("slugs_updated_success", { count: updatedCount }));',
  'setMessageModal({ isOpen: true, type: "success", title: t("success"), message: t("slugs_updated_success", { count: updatedCount }) });'
);

code = code.replace(
  'alert(t("error") + ": " + e.message);',
  'setMessageModal({ isOpen: true, type: "error", title: t("error"), message: e.message });'
);

const modalElement = `
      <MessageModal 
        isOpen={messageModal.isOpen} 
        onClose={() => setMessageModal(prev => ({ ...prev, isOpen: false }))} 
        type={messageModal.type} 
        title={messageModal.title} 
        message={messageModal.message} 
      />
`;

code = code.replace(
  "</div>\n    </div>",
  "</div>\n" + modalElement + "    </div>"
);

fs.writeFileSync('src/pages/admin/AdminDashboardHome.tsx', code);
