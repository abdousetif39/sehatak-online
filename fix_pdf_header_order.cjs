const fs = require('fs');
const file = 'src/pages/doctor/DoctorDashboardHome.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace HTML
const oldHtml = `            <div class="doctor-date-row">
              \${isArabic ? \`
              <div class="doctor-name-pdf">\${doctorName}</div>
              <div class="separator">|</div>
              <div class="date-pdf">
                <span class="date-label">\${t('date')}:</span>
                <span class="date-value">\${selectedDate}</span>
              </div>
              \` : \`
              <div class="doctor-name-pdf">\${doctorName}</div>
              <div class="separator">|</div>
              <div class="date-pdf">
                <span class="date-label">\${t('date')}:</span>
                <span class="date-value">\${selectedDate}</span>
              </div>
              \`}
            </div>`;

const newHtml = `            <div class="doctor-date-row">
              \${isArabic ? \`
              <div class="date-pdf">
                <span class="date-label">\${t('date')}:</span>
                <span class="date-value">\${selectedDate}</span>
              </div>
              <div class="separator">|</div>
              <div class="doctor-name-pdf">\${doctorName}</div>
              \` : \`
              <div class="date-pdf">
                <span class="date-label">\${t('date')} :</span>
                <span class="date-value">\${selectedDate}</span>
              </div>
              <div class="separator">|</div>
              <div class="doctor-name-pdf">\${doctorName}</div>
              \`}
            </div>`;

content = content.replace(oldHtml, newHtml);

fs.writeFileSync(file, content);
