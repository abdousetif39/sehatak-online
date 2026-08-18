const fs = require('fs');

let content = fs.readFileSync('src/pages/doctor/Calendar.tsx', 'utf8');

const isWorkingDayCode = `const isWorkingDay = (day: Date) => {
  if (!doctor) return true;
  const weekDay = day.getDay();
  if (!doctor.workingDays?.includes(weekDay)) {
    return false;
  }
  return true;
};`;

const isWorkingDayRegex = /const isWorkingDay = \(day: Date\) => \{\s*if \(\!doctor\) return true;\s*const weekDay = day\.getDay\(\);\s*if \(\!doctor\.workingDays\?\.includes\(weekDay\)\) \{\s*return false;\s*\}\s*return true;\s*\};/g;

const getVacationForDayCode = `const getVacationForDay = (day: Date) => {
  if (!doctor || !doctor.vacations) return null;
  const dayStr = format(day, "yyyy-MM-dd");
  return doctor.vacations.find(v => dayStr >= v.startDate && dayStr <= v.endDate) || null;
};`;

if (!content.includes('const getVacationForDay')) {
  content = content.replace(isWorkingDayRegex, isWorkingDayCode + '\n' + getVacationForDayCode);
  fs.writeFileSync('src/pages/doctor/Calendar.tsx', content);
  console.log("Added getVacationForDay");
} else {
  console.log("Already added");
}
