const fs = require('fs');
let code = fs.readFileSync('src/pages/doctor/DoctorDashboardHome.tsx', 'utf8');

if (!code.includes('ConfirmDeleteModal')) {
  code = code.replace(/(import .*;\n)(?!import)/s, "$1import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';\n");
}

if (!code.includes('deleteModalOpen')) {
  code = code.replace(/const \[searchTerm, setSearchTerm\] = useState\(''\);/, "const [searchTerm, setSearchTerm] = useState('');\n  const [deleteModalOpen, setDeleteModalOpen] = useState(false);\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);\n  const [isDeleting, setIsDeleting] = useState(false);");
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
      console.log("Firestore path:", COLLECTIONS.APPOINTMENTS, id);
      const batch = writeBatch(db);
      batch.delete(doc(db, COLLECTIONS.APPOINTMENTS, id));
      batch.delete(doc(db, COLLECTIONS.PUBLIC_SLOTS, id));
      await batch.commit();
      await fetchAppointments();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (e: any) {
      console.error("Delete Error:", { id, collection: 'appointments/public_slots', errorCode: e.code, message: e.message });
      alert(\`Delete failed: \${e.message}\`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (`;

code = code.replace(regex, replacement);

code = code.replace(/onClick=\{\(\) => handleDelete\(app\.id\)\}/g, "onClick={() => confirmDelete(app.id)}");

code = code.replace(/    <\/div>\n  \);/, 
`      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('confirm_delete_appointment_title', 'حذف موعد')}
        message={t('confirm_delete_appointment_desc', 'هل أنت متأكد أنك تريد حذف هذا الموعد؟ سيتم إزالته من النظام والمواعيد المتاحة.')}
      />
    </div>
  );`);

fs.writeFileSync('src/pages/doctor/DoctorDashboardHome.tsx', code);
