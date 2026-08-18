const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
  /function isAdmin\(\) \{\s*return request\.auth != null && get\(\/databases\/\$\(database\)\/documents\/users\/\$\(request\.auth\.uid\)\)\.data\.role == 'admin';\s*\}/,
  `function isAdmin() {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid));
      return request.auth != null && userDoc != null && userDoc.data.role == 'admin';
    }`
);

code = code.replace(
  /function isDoctor\(\) \{\s*return request\.auth != null && get\(\/databases\/\$\(database\)\/documents\/users\/\$\(request\.auth\.uid\)\)\.data\.role == 'doctor';\s*\}/,
  `function isDoctor() {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid));
      return request.auth != null && userDoc != null && userDoc.data.role == 'doctor';
    }`
);

fs.writeFileSync('firestore.rules', code);
