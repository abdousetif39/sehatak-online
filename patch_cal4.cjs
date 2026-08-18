const fs = require('fs');

let content = fs.readFileSync('src/pages/doctor/Calendar.tsx', 'utf8');

const startStr = '<div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">';
const startIndex = content.indexOf(startStr);
const endStr = '))}\n</div>\n</div>';
const endIndex = content.indexOf('))}');

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = startStr + `
  {days.map((day) => {
    const vacation = getVacationForDay(day);
    return (
    <button
  key={day.toISOString()}
  onClick={() => {
    if (!vacation) setSelectedDay(day);
  }}
  title={vacation ? (isAr ? vacation.titleAr : vacation.titleFr) : undefined}
  disabled={!!vacation}
  className={\`border rounded-xl p-4 text-center transition-colors relative group \${
  vacation 
    ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-80"
    : selectedDay &&
  format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    ? "bg-blue-600 text-white border-blue-600"
    : !isWorkingDay(day)
    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
    : appointmentsCount[format(day, "yyyy-MM-dd")] > 0
    ? "bg-green-50 hover:bg-green-100 border-green-300"
    : "bg-slate-50 hover:bg-blue-50 border-slate-200"}\`}>
      <div
  className={\`font-bold \${
    vacation ? "text-red-500" :
    selectedDay &&
    format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      ? "text-white"
      : "text-slate-800"
  }\`}>
        {format(day, "dd")}
      </div>
      <div
  className={\`text-sm mt-1 \${
    vacation ? "text-red-400" :
    selectedDay &&
    format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      ? "text-blue-100"
      : "text-slate-500"
  }\`}>
  {format(day, "EEEE", { locale })}</div>
  
  {vacation ? (
    <div className="mt-2 text-xs font-medium text-red-500 flex items-center justify-center gap-1">
      <span>🏖️</span>
      <span>{t("doctor_on_vacation", "إجازة")}</span>
    </div>
  ) : (
<div
  className={\`mt-2 text-xs font-medium \${
    selectedDay &&
    format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      ? "text-blue-100"
      : "text-blue-600"
  }\`}>
  👥 {appointmentsCount[format(day, "yyyy-MM-dd")] || 0} {t("appointments")}</div>
  )}
    </button>
  )
})}
</div>
</div>`;

  // Actually find the end of the divs
  const rest = content.substring(endIndex);
  const endDivsIndex = rest.indexOf('</div>\n</div>');
  const fullEndIndex = endIndex + (endDivsIndex !== -1 ? endDivsIndex + 12 : 3); // Approximate, let's just find the first text after
  
  // A safer approach:
  const match = content.substring(startIndex).match(/\{\s*days\.map[\s\S]+?\}\)\}\s*<\/div>\s*<\/div>/);
  if (match) {
    content = content.substring(0, startIndex) + replacement + content.substring(startIndex + match[0].length);
    fs.writeFileSync('src/pages/doctor/Calendar.tsx', content);
    console.log("Success replacing.");
  } else {
    console.log("Could not match regex for replacement.");
  }
} else {
  console.log("Could not find start index.");
}
