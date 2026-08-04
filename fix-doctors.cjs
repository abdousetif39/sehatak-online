const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

if (!code.includes('ConfirmDeleteModal')) {
  code = code.replace(/(import .*;\n)(?!import)/s, "$1import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';\n");
}

if (!code.includes('deleteModalOpen')) {
  code = code.replace(/const \[loading, setLoading\] = useState\(true\);/, "const [loading, setLoading] = useState(true);\n  const [deleteModalOpen, setDeleteModalOpen] = useState(false);\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);\n  const [isDeleting, setIsDeleting] = useState(false);");
}

const regex = /const handleDelete = async \(id: string\) => \{[\s\S]*?\}\s*\};\s*(const\s|return)/;

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
      await deleteDoc(doc(db, COLLECTIONS.DOCTORS, id));
      await fetchData();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch(e: any) {
      console.error("Delete Error:", { id, collection: 'users/doctors', errorCode: e.code, message: e.message });
      alert(\`Delete failed: \${e.message}\`);
    } finally {
      setIsDeleting(false);
    }
  };

  $1`;

code = code.replace(regex, replacement);

// Replace button onClick
code = code.replace(/onClick=\{\(\) => handleDelete\(u\.id\)\}/g, "onClick={() => confirmDelete(u.id)}");

// Add Modal
const modalStr = `      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('confirm_delete_doctor_title', 'حذف طبيب')}
        message={t('confirm_delete_doctor_desc', 'هل أنت متأكد أنك تريد حذف هذا الطبيب؟ سيتم حذف جميع البيانات المتعلقة به.')}
      />
    </div>`;
code = code.replace(/<\/div>\s*$/m, modalStr); // add to end of component, wait, might be wrong.
fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', code);
