const fs = require('fs');

function addModalToComponent(filePath, confirmMessageKey, defaultConfirmMessage) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Import ConfirmDeleteModal if not present
  if (!code.includes('ConfirmDeleteModal')) {
    // Add import after the last import
    code = code.replace(/(import .*;\n)(?!import)/s, "$1import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';\n");
    // If DoctorsManager etc, the path might be different, wait, both are in pages/folder/ so '../../components/ConfirmDeleteModal' works.
  }

  // Add State variables
  if (!code.includes('deleteModalOpen')) {
    code = code.replace(/const \[loading, setLoading\] = useState\(true\);/, "const [loading, setLoading] = useState(true);\n  const [deleteModalOpen, setDeleteModalOpen] = useState(false);\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);\n  const [isDeleting, setIsDeleting] = useState(false);");
  }

  // Rewrite handleDelete
  code = code.replace(/const handleDelete = async \(id: string\) => {[\s\S]*?if \(confirm[^\)]+\)\) {/m, `const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete;
    setIsDeleting(true);
    try {`);

  // Handle the end of handleDelete
  code = code.replace(/await fetch[a-zA-Z]*\(\);\s*} catch \([^\)]+\) {[\s\S]*?alert\([^\)]+\);\s*throw [^;]+;\s*}\s*}/m, `await fetchStaff();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (e: any) {
      console.error("Delete Error:", { id, errorCode: e.code, message: e.message });
      alert(\`Delete failed: \${e.message}\`);
    } finally {
      setIsDeleting(false);
    }`);
    // Wait, the regex for the end of handleDelete is tricky because each file has a different fetch function or update function.
    
}
