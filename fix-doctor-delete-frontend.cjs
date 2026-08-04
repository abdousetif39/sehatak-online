const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

const regex = /try\s*\{\s*console\.log\("Delete ID:", id\);[\s\S]*?await fetchData\(\);/s;

const replacement = `try {
      console.log("Secure Delete Doctor ID:", id);
      
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch('/api/delete-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ doctorId: id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete doctor');
      }

      await fetchData();`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', code);
