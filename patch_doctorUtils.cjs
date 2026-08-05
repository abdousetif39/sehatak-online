const fs = require('fs');
let content = fs.readFileSync('src/utils/doctorUtils.ts', 'utf8');

const newFormatWorkingDays = `export const formatWorkingDays = (days: number[], t: any): string => {
  if (!days || days.length === 0) return '';
  if (days.length === 1) return t(\`day_\${days[0]}\`);
  if (days.length === 7) return t('everyday') || 'كل الأيام';

  // Map JS days (0=Sun, ..., 6=Sat) to Algerian week order (0=Sat, ..., 6=Fri)
  const toAlgerianWeek = (day: number) => (day === 6 ? 0 : day + 1);
  const fromAlgerianWeek = (algDay: number) => (algDay === 0 ? 6 : algDay - 1);

  const sortedDays = [...days].sort((a, b) => toAlgerianWeek(a) - toAlgerianWeek(b));
  
  let isConsecutive = true;
  for (let i = 1; i < sortedDays.length; i++) {
    if (toAlgerianWeek(sortedDays[i]) !== toAlgerianWeek(sortedDays[i - 1]) + 1) {
      isConsecutive = false;
      break;
    }
  }

  if (isConsecutive) {
    return \`\${t('from')} \${t(\`day_\${sortedDays[0]}\`)} \${t('to')} \${t(\`day_\${sortedDays[sortedDays.length - 1]}\`)}\`;
  }

  const algDays = sortedDays.map(toAlgerianWeek);
  let gaps = 0;
  let gapIndex = -1;
  for (let i = 0; i < algDays.length; i++) {
    const next = (i + 1) % algDays.length;
    let diff = algDays[next] - algDays[i];
    if (diff < 0) diff += 7;
    if (diff > 1) {
      gaps++;
      gapIndex = i;
    }
  }

  if (gaps === 1) {
    const startDayAlg = algDays[(gapIndex + 1) % algDays.length];
    const endDayAlg = algDays[gapIndex];
    return \`\${t('from')} \${t(\`day_\${fromAlgerianWeek(startDayAlg)}\`)} \${t('to')} \${t(\`day_\${fromAlgerianWeek(endDayAlg)}\`)}\`;
  }

  return sortedDays.map(d => t(\`day_\${d}\`)).join('، ');
};`;

content = content.replace(/export const formatWorkingDays = [\s\S]*?^};/m, newFormatWorkingDays);

fs.writeFileSync('src/utils/doctorUtils.ts', content);
console.log("Patched doctorUtils.ts");
