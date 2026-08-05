const fs = require('fs');
let content = fs.readFileSync('src/pages/public/DoctorProfile.tsx', 'utf8');

const isVacationDayFunc = `const isVacationDay = (
  doctor: Doctor,
  date: Date
) => {
  if (!doctor.vacations?.length) return false;

  const selected = format(date, "yyyy-MM-dd");

  return doctor.vacations.some((vacation) => {
    return (
      selected >= vacation.startDate &&
      selected <= vacation.endDate
    );
  });
};`;

const newIsVacationDayFunc = `const isVacationDay = (
  doctor: Doctor,
  date: Date
) => {
  if (!doctor.vacations?.length) return false;

  const selected = format(date, "yyyy-MM-dd");

  return doctor.vacations.some((vacation) => {
    return (
      selected >= vacation.startDate &&
      selected <= vacation.endDate
    );
  });
};

const getVacationReason = (
  doctor: Doctor,
  date: Date,
  lang: string
) => {
  if (!doctor.vacations?.length) return null;
  const selected = format(date, "yyyy-MM-dd");
  const vacation = doctor.vacations.find(
    (v) => selected >= v.startDate && selected <= v.endDate
  );
  if (!vacation) return null;
  
  const reason = lang === 'ar' ? vacation.reasonAr : vacation.reasonFr;
  return reason || null;
};`;

content = content.replace(isVacationDayFunc, newIsVacationDayFunc);

const noSlotsBlock = `                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                    {isVacationDay(doctor, selectedDate)
                    ? t("doctor_on_vacation")
                    : t("no_appointments_available")}
                    </p>
                  </div>`;

const newNoSlotsBlock = `                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <div className="text-slate-500 font-medium">
                    {isVacationDay(doctor, selectedDate) ? (
                      <>
                        <p>🚫 {t("doctor_on_vacation")}</p>
                        {getVacationReason(doctor, selectedDate, i18n.language) && (
                          <p className="mt-2 text-sm">
                            {i18n.language === 'ar' ? 'السبب: ' : 'Motif : '} 
                            {getVacationReason(doctor, selectedDate, i18n.language)}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>{t("no_appointments_available")}</p>
                    )}
                    </div>
                  </div>`;

content = content.replace(noSlotsBlock, newNoSlotsBlock);

fs.writeFileSync('src/pages/public/DoctorProfile.tsx', content);
console.log("Patched DoctorProfile.tsx");
