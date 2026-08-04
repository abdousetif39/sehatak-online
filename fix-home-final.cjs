const fs = require('fs');
let code = fs.readFileSync('src/pages/doctor/DoctorDashboardHome.tsx', 'utf8');

const regex = /const handleDelete = async \(id: string\) => \{[\s\S]*?\}\s*\};/;

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
  };`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/doctor/DoctorDashboardHome.tsx', code);
