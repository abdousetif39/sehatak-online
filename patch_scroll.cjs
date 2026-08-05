const fs = require('fs');
let content = fs.readFileSync('src/pages/public/DoctorProfile.tsx', 'utf8');

const oldEffect = `  useEffect(() => {
    if (selectedDayRef.current) {
      selectedDayRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDate]);`;

const newEffect = `  useEffect(() => {
    if (selectedDayRef.current) {
      selectedDayRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDate, loading]);`;

content = content.replace(oldEffect, newEffect);

fs.writeFileSync('src/pages/public/DoctorProfile.tsx', content);
console.log("Patched scroll effect");
