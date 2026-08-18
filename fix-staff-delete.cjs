const fs = require('fs');
let code = fs.readFileSync('src/pages/doctor/StaffManager.tsx', 'utf8');

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
      await fetchStaff();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (e: any) {
      console.error("Delete Error:", { id, collection: COLLECTIONS.USERS, errorCode: e.code, message: e.message });
      alert(\`Delete failed: \${e.message}\`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/doctor/StaffManager.tsx', code);
