const fs = require('fs');

let content = fs.readFileSync('src/pages/public/Home.tsx', 'utf8');

content = content.replace(
  /result = result\.filter\(d => \{[\s\S]*?\}\);/,
  `result = result.filter(d => {
        const arName = getDoctorFullName(d, 'ar').toLowerCase();
        const frName = getDoctorFullName(d, 'fr').toLowerCase();
        const search = searchName.toLowerCase().replace(/\\s+/g, '');
        
        const arNoSpace = arName.replace(/\\s+/g, '');
        const frNoSpace = frName.replace(/\\s+/g, '');
        const origNoSpace = (d.name || '').toLowerCase().replace(/\\s+/g, '');

        return arNoSpace.includes(search) || frNoSpace.includes(search) || origNoSpace.includes(search);
      });`
);

fs.writeFileSync('src/pages/public/Home.tsx', content);
