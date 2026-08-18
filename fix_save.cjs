const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

const saveRegex1 = /await setDoc\(doc\(db, COLLECTIONS\.DOCTORS, uid\), newDoctor\);/;
const replace1 = `newDoctor.state = getStateByName(String(stateName))?.id || stateName;\n        await setDoc(doc(db, COLLECTIONS.DOCTORS, uid), newDoctor);`;
content = content.replace(saveRegex1, replace1);

const updateRegex = /state: stateName,/g;
content = content.replace(updateRegex, 'state: getStateByName(String(stateName))?.id || stateName,');

fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', content);
console.log("Updated save logic.");
