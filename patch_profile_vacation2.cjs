const fs = require('fs');
let content = fs.readFileSync('src/pages/public/DoctorProfile.tsx', 'utf8');

const oldBlock = `{isVacationDay(doctor, selectedDate) ? (
                      <>
                        <p>🚫 {t("doctor_on_vacation")}</p>
                        {getVacationReason(doctor, selectedDate, i18n.language) && (
                          <p className="mt-2 text-sm">
                            {i18n.language === 'ar' ? 'السبب: ' : 'Motif : '} 
                            {getVacationReason(doctor, selectedDate, i18n.language)}
                          </p>
                        )}
                      </>
                    ) : (`;

const newBlock = `{isVacationDay(doctor, selectedDate) ? (
                      getVacationReason(doctor, selectedDate, i18n.language) ? (
                        <>
                          <p>🚫 {t("doctor_on_vacation")}</p>
                          <p className="mt-2 text-sm">
                            {i18n.language === 'ar' ? 'السبب: ' : 'Motif : '} 
                            {getVacationReason(doctor, selectedDate, i18n.language)}
                          </p>
                        </>
                      ) : (
                        <p>{t("doctor_on_vacation")}</p>
                      )
                    ) : (`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/pages/public/DoctorProfile.tsx', content);
console.log("Patched DoctorProfile.tsx 2");
