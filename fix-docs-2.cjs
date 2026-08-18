const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

// Fix import
if (!code.includes('ConfirmDeleteModal')) {
  code = code.replace(/import \{ COLLECTIONS, ROLES \} from '\.\.\/\.\.\/lib\/constants';/, "import { COLLECTIONS, ROLES } from '../../lib/constants';\nimport ConfirmDeleteModal from '../../components/ConfirmDeleteModal';");
}

// Remove the wrongly added import at the end
code = code.replace(/import ConfirmDeleteModal from '\.\.\/\.\.\/components\/ConfirmDeleteModal';\n?\}$/, '}');

// Move the modal to the correct place
code = code.replace(/      <ConfirmDeleteModal\n[\s\S]*?<\/div>$/, ''); // remove broken string at end
// add it inside DoctorsManager return

// find end of DoctorsManager return
code = code.replace(/      \{isModalOpen && \(\n        <DoctorModal[\s\S]*?\/>\n      \)\}\n    <\/div>\n  \);/, 
`      {isModalOpen && (
        <DoctorModal
          user={editingUser}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchData(); }} 
        />
      )}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('confirm_delete_doctor_title', 'حذف طبيب')}
        message={t('confirm_delete_doctor_desc', 'هل أنت متأكد أنك تريد حذف هذا الطبيب؟ سيتم حذف جميع البيانات المتعلقة به.')}
      />
    </div>
  );`);

fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', code);
