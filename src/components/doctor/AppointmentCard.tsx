import React from "react";
import { useTranslation } from "react-i18next";
import { Appointment } from "../../types";

interface Props {
  key?: string | number;
  appointment: Appointment;
  updateAppointmentStatus: (
    appointmentId: string,
    status: string
  ) => void | Promise<void>;

  onEdit: () => void;

  onDelete: () => void | Promise<void>;
}

export default function AppointmentCard({
  appointment,
  updateAppointmentStatus,
  onEdit,
  onDelete,
}: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

      <div className="flex justify-between items-start">

        <div>

          <h4 className="font-bold text-slate-800 text-lg">
            {appointment.patientName} {appointment.patientLastName}
          </h4>

          <p className="text-slate-500 mt-1">
            🕒 {appointment.time}
          </p>

          <p className="text-slate-500">
            📞 {appointment.patientPhone}
          </p>

        </div>

        <div className="text-end">

          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              appointment.status === "booked"
              ? "bg-blue-100 text-blue-700"
              : appointment.status === "examined"
              ? "bg-green-100 text-green-700"
              : appointment.status === "no_show"
              ? "bg-amber-100 text-amber-700"
              : appointment.status === "cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-slate-100 text-slate-700"
            }`}
          >
            {appointment.status === "booked"
            ? `🟢 ${t("status_booked")}`
            : appointment.status === "examined"
            ? `✅ ${t("status_examined")}`
            : appointment.status === "no_show"
            ? `⚠️ ${t("status_no_show")}`
            : appointment.status === "cancelled"
            ? `❌ ${t("status_cancelled")}`
            : appointment.status}
          </span>

          <div className="mt-4 flex gap-2 flex-wrap">

          <button
          onClick={onEdit}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
          ✏️ {t("edit")}
          </button>
          <button
          onClick={onDelete}
          className="px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-800"
          >
          🗑️ {t("delete")}
          </button>
          {appointment.status === "booked" && (
          <>
          <button
          onClick={() =>
          updateAppointmentStatus(
            appointment.id,
            "examined"
          )
          }
          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
          >
          ✅ {t("completed")}
          </button>

          <button
          onClick={() =>
          updateAppointmentStatus(
          appointment.id,
          "no_show"
          )
          }
          className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700"
          >
          ⚠️ {t("mark_no_show")}
          </button>

          <button
          onClick={() =>
          updateAppointmentStatus(
            appointment.id,
            "cancelled"
          )
        }
          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
          >
          ❌ {t("cancel")}
          </button>
          </>
  )}

</div>

        </div>

      </div>

    </div>
  );
}