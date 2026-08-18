const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ReceptionistsManager.tsx', 'utf8');

if (!code.includes('ConfirmDeleteModal')) {
  code = code.replace(/import \{ COLLECTIONS, ROLES \} from '\.\.\/\.\.\/lib\/constants';/, "import { COLLECTIONS, ROLES } from '../../lib/constants';\nimport ConfirmDeleteModal from '../../components/ConfirmDeleteModal';");
}

if (!code.includes('deleteModalOpen')) {
  code = code.replace(/const \[loading, setLoading\] = useState\(true\);/, "const [loading, setLoading] = useState(true);\n  const [deleteModalOpen, setDeleteModalOpen] = useState(false);\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);\n  const [isDeleting, setIsDeleting] = useState(false);");
}

const regex = /const handleDelete = async \(id: string\) => \{[\s\S]*?\}\s*\};\s*return \(/;

const replacement = `const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete;
    setIsDeleting(true);
    try {
      console.log("Delete ID:", id);
      console.log("Firestore path:", COLLECTIONS.USERS, id);
      await deleteDoc(doc(db, COLLECTIONS.USERS, id));
      await fetchData();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch(e: any) {
      console.error("Delete Error:", { id, collection: COLLECTIONS.USERS, errorCode: e.code, message: e.message });
      alert(\`Delete failed: \${e.message}\`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (`;

code = code.replace(regex, replacement);

code = code.replace(/onClick=\{\(\) => handleDelete\(u\.id\)\}/g, "onClick={() => confirmDelete(u.id)}");

code = code.replace(/      \{isModalOpen && \(\n        <ReceptionistModal[\s\S]*?\/>\n      \)\}\n    <\/div>\n  \);/, 
`      {isModalOpen && (
        <ReceptionistModal
          user={editingUser}
          doctors={doctorsList}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchData(); }} 
        />
      )}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('confirm_delete_receptionist_title', 'حذف موظف استقبال')}
        message={t('confirm_delete_receptionist_desc', 'هل أنت متأكد أنك تريد حذف موظف الاستقبال هذا؟')}
      />
    </div>
  );`);

fs.writeFileSync('src/pages/admin/ReceptionistsManager.tsx', code);
