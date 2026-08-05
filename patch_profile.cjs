const fs = require('fs');
let content = fs.readFileSync('src/pages/public/DoctorProfile.tsx', 'utf8');

// 1. Add useRef
content = content.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);

// 2. Add ref state and useEffect
const stateAnchor = "const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));";
const newStateStr = `const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const selectedDayRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (selectedDayRef.current) {
      selectedDayRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDate]);`;

content = content.replace(stateAnchor, newStateStr);

// 3. Update the day button to have ref if selected
const btnAnchor = `<button
                        key={i}
                        disabled={!isWorkingDay || isVacation || isFullyBooked}`;

const newBtnAnchor = `<button
                        key={i}
                        ref={isSelected ? selectedDayRef : null}
                        disabled={!isWorkingDay || isVacation || isFullyBooked}`;
content = content.replace(btnAnchor, newBtnAnchor);

// 4. Show vacation description
const oldVacationText = `{isVacation ? (
                        <span className="text-[10px] text-orange-600 font-bold mt-1 bg-orange-50 px-2 py-0.5 rounded-full">
                        {t("doctor_on_vacation")}
                        </span>
                        ) : isFullyBooked ? (`;

const newVacationText = `{isVacation ? (
                        <>
                          <span className="text-[10px] text-orange-600 font-bold mt-1 bg-orange-50 px-2 py-0.5 rounded-full">
                          {t("doctor_on_vacation")}
                          </span>
                          {getVacationReason(doctor, date, i18n.language) && (
                            <span className="text-[9px] text-orange-500 text-center mt-1 truncate w-full px-1">
                              {getVacationReason(doctor, date, i18n.language)}
                            </span>
                          )}
                        </>
                        ) : isFullyBooked ? (`;

content = content.replace(oldVacationText, newVacationText);

fs.writeFileSync('src/pages/public/DoctorProfile.tsx', content);
console.log("Patched DoctorProfile.tsx");
