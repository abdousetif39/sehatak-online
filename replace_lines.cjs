const fs = require('fs');

let content = fs.readFileSync('src/pages/doctor/Calendar.tsx', 'utf8');
let lines = content.split('\n');

const startLine = 333; // 0-indexed is 333 for line 334
const endLine = 384;   // 0-indexed is 384 for line 385

const mapReplacement = [
  '  {days.map((day) => {',
  '    const vacation = getVacationForDay(day);',
  '    return (',
  '    <button',
  '  key={day.toISOString()}',
  '  onClick={() => {',
  '    if (!vacation) setSelectedDay(day);',
  '  }}',
  '  title={vacation ? (isAr ? vacation.titleAr : vacation.titleFr) : undefined}',
  '  disabled={!!vacation}',
  '  className={`border rounded-xl p-4 text-center transition-colors relative group ${',
  '  vacation ',
  '    ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-80"',
  '    : selectedDay &&',
  '  format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")',
  '    ? "bg-blue-600 text-white border-blue-600"',
  '    : !isWorkingDay(day)',
  '    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"',
  '    : appointmentsCount[format(day, "yyyy-MM-dd")] > 0',
  '    ? "bg-green-50 hover:bg-green-100 border-green-300"',
  '    : "bg-slate-50 hover:bg-blue-50 border-slate-200"}`}>',
  '      <div',
  '  className={`font-bold ${',
  '    vacation ? "text-red-500" :',
  '    selectedDay &&',
  '    format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")',
  '      ? "text-white"',
  '      : "text-slate-800"',
  '  }`}>',
  '        {format(day, "dd")}',
  '      </div>',
  '      <div',
  '  className={`text-sm mt-1 ${',
  '    vacation ? "text-red-400" :',
  '    selectedDay &&',
  '    format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")',
  '      ? "text-blue-100"',
  '      : "text-slate-500"',
  '  }`}>',
  '  {format(day, "EEEE", { locale })}</div>',
  '  ',
  '  {vacation ? (',
  '    <div className="mt-2 text-xs font-medium text-red-500 flex items-center justify-center gap-1">',
  '      <span>🏖️</span>',
  '      <span>{t("doctor_on_vacation", "إجازة")}</span>',
  '    </div>',
  '  ) : (',
  '<div',
  '  className={`mt-2 text-xs font-medium ${',
  '    selectedDay &&',
  '    format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")',
  '      ? "text-blue-100"',
  '      : "text-blue-600"',
  '  }`}>',
  '  👥 {appointmentsCount[format(day, "yyyy-MM-dd")] || 0} {t("appointments")}</div>',
  '  )}',
  '    </button>',
  '  )',
  '})}</div></div>'
].join('\n');

lines.splice(startLine, endLine - startLine + 1, mapReplacement);
fs.writeFileSync('src/pages/doctor/Calendar.tsx', lines.join('\n'));
console.log("Lines replaced successfully.");
