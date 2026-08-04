const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/const allUsers = usersSnap\.docs\.map\(doc => \(\{ \.\.\.doc\.data\(\), id: doc\.id \}\)\);/g, "const allUsers = usersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));");
  fs.writeFileSync(file, code);
}

fixFile('src/pages/admin/DoctorsManager.tsx');
fixFile('src/pages/admin/ReceptionistsManager.tsx');
