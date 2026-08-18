import {
  addMinutes,
  format,
  getDay,
  isBefore,
  isSameDay,
  parse,
} from "date-fns";

import { Doctor } from "../types";

/**
 * هل الوقت داخل فترة استراحة؟
 */
export const isBreakTime = (
  doctor: Doctor,
  day: number,
  time: string
) => {
  const breaks = [
    doctor.morningBreak,
    doctor.lunchBreak,
    doctor.eveningBreak,
  ];

  for (const br of breaks) {
    if (!br) continue;

    if (!br.enabled) continue;

    if (!br.days.includes(day)) continue;

    if (time >= br.start && time < br.end) {
      return true;
    }
  }

  return false;
};

/**
 * هل اليوم عطلة للطبيب؟
 */
export const isVacationDay = (
  doctor: Doctor,
  date: Date
) => {
  if (!doctor.vacations?.length) return false;

  const current = format(date, "yyyy-MM-dd");

  return doctor.vacations.some((vacation) => {
    return (
      current >= vacation.startDate &&
      current <= vacation.endDate
    );
  });
};
/**
 * توليد جميع الأوقات المتاحة للطبيب
 */
export const getAvailableSlots = (
  doctor: Doctor,
  date: Date,
  bookedSlots: string[]
): string[] => {
  if (isVacationDay(doctor, date)) return [];

  if (!doctor.workingDays?.includes(getDay(date))) return [];

  const slots: string[] = [];

  const baseDate = new Date();

  let current = parse(
    doctor.startTime,
    "HH:mm",
    baseDate
  );

  const end = parse(
    doctor.endTime,
    "HH:mm",
    baseDate
  );

  const now = new Date();
  const isToday = isSameDay(date, now);

  while (current < end) {
    const time = format(current, "HH:mm");

    // تجاهل وقت الاستراحة
    if (
      isBreakTime(
        doctor,
        getDay(date),
        time
      )
    ) {
      current = addMinutes(
        current,
        doctor.appointmentDuration || 15
      );
      continue;
    }

    let available = !bookedSlots.includes(time);

    // تجاهل الأوقات الماضية إذا كان اليوم هو اليوم الحالي
    if (available && isToday) {
      const slotTime = parse(
        time,
        "HH:mm",
        now
      );

      if (isBefore(slotTime, now)) {
        available = false;
      }
    }

    if (available) {
      slots.push(time);
    }

    current = addMinutes(
      current,
      doctor.appointmentDuration || 15
    );
  }

  return slots;
};