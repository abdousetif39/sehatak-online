const fs = require('fs');
let content = fs.readFileSync('src/pages/Public.tsx', 'utf8');

// Add import
content = content.replace(
  "import DoctorProfile from './public/DoctorProfile';",
  "import DoctorProfile from './public/DoctorProfile';\nimport Pricing from './public/Pricing';"
);

// Add route
content = content.replace(
  "<Route path=\"p/:id\" element={<DoctorProfile />} />",
  "<Route path=\"p/:id\" element={<DoctorProfile />} />\n          <Route path=\"pricing\" element={<Pricing />} />"
);

fs.writeFileSync('src/pages/Public.tsx', content);
console.log("Patched Public.tsx");
