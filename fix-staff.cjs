const fs = require('fs');
let code = fs.readFileSync('src/pages/doctor/StaffManager.tsx', 'utf8');

const regex = /catch \(e: any\) \{\n\s*console\.error\(e\);\n\s*setError\(e\.message\);\n\s*\}/;

const replacement = `catch (e: any) {
      console.error(e);
      if (e.code === 'auth/email-already-in-use') {
        setError(t('email_in_use', 'البريد الإلكتروني مستخدم بالفعل لطبيب أو مستخدم آخر.'));
      } else {
        setError(e.message);
      }
    }`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/doctor/StaffManager.tsx', code);
