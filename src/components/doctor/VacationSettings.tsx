import React, { useState } from "react";
import { Doctor, DoctorVacation, Appointment } from "../../types";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../lib/constants";

interface Props {
  formData: Partial<Doctor>;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<Doctor>>
  >;
}

const emptyVacation: DoctorVacation = {
  id: "",
  titleAr: "",
  titleFr: "",
  startDate: "",
  endDate: "",
  descriptionAr: "",
  descriptionFr: "",
};

export default function VacationSettings({
  formData,
  setFormData,
}: Props) {
  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vacation, setVacation] = useState<DoctorVacation>(emptyVacation);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningType, setWarningType] = useState<
    "name" | "appointments" | "start_date" | "end_date" | "both_dates" | "invalid_dates" | null
  >(null);
  const [affectedAppointments, setAffectedAppointments] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const vacations = formData.vacations || [];

  const resetForm = () => {
    setVacation(emptyVacation);
    setEditingId(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item: DoctorVacation) => {
    setVacation(item);
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      vacations: (prev.vacations || []).filter(
        (v) => v.id !== id
      ),
    }));
  };

  const handleSave = async () => {
    if (!vacation.titleAr || !vacation.titleFr) {
      setWarningType("name");
      setWarningModalOpen(true);
      return;
    }

    if (!vacation.startDate && !vacation.endDate) {
      setWarningType("both_dates");
      setWarningModalOpen(true);
      return;
    }

    if (!vacation.startDate) {
      setWarningType("start_date");
      setWarningModalOpen(true);
      return;
    }

    if (!vacation.endDate) {
      setWarningType("end_date");
      setWarningModalOpen(true);
      return;
    }

    if (vacation.endDate < vacation.startDate) {
      setWarningType("invalid_dates");
      setWarningModalOpen(true);
      return;
    }

    // Check for existing appointments
    if (formData.id) {
      setIsChecking(true);
      try {
        const q = query(
          collection(db, COLLECTIONS.APPOINTMENTS),
          where("doctorId", "==", formData.id),
          where("date", ">=", vacation.startDate),
          where("date", "<=", vacation.endDate)
        );

        const snap = await getDocs(q);
        
        // Filter out cancelled appointments
        const activeAppointments = snap.docs.filter((doc) => {
          const data = doc.data() as Appointment;
          return data.status !== "cancelled";
        });

        if (activeAppointments.length > 0) {
          setAffectedAppointments(activeAppointments.length);
          setWarningType("appointments");
          setWarningModalOpen(true);
          setIsChecking(false);
          return;
        }
      } catch (error) {
        console.error("Error checking appointments:", error);
      }
      setIsChecking(false);
    }

    let list = [...vacations];
    if (editingId) {
      list = list.map((v) => (v.id === editingId ? vacation : v));
    } else {
      list.push({
        ...vacation,
        id: crypto.randomUUID(),
      });
    }

    setFormData((prev) => ({
      ...prev,
      vacations: list,
    }));
    resetForm();
    setShowModal(false);
  };

  const getWarningTitle = () => {
    switch (warningType) {
      case "name": return t("vacation_name_required_title");
      case "both_dates": return t("vacation_both_dates_required_title");
      case "start_date": return t("vacation_start_date_required_title");
      case "end_date": return t("vacation_end_date_required_title");
      case "invalid_dates": return t("vacation_invalid_dates_title");
      case "appointments": return t("appointments_exist_in_vacation_title");
      default: return "";
    }
  };

  const getWarningDesc = () => {
    switch (warningType) {
      case "name": return t("vacation_name_required_desc");
      case "both_dates": return t("vacation_both_dates_required_desc");
      case "start_date": return t("vacation_start_date_required_desc");
      case "end_date": return t("vacation_end_date_required_desc");
      case "invalid_dates": return t("vacation_invalid_dates_desc");
      case "appointments": return t("appointments_exist_in_vacation_desc");
      default: return "";
    }
  };

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {t("vacations")}
              </h2>
              <p className="text-sm text-slate-500">
                {t("vacations_description")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
            {t("add_vacation")}
          </button>
        </div>

        {vacations.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
            {t("no_vacations")}
          </div>
        ) : (
          <div className="space-y-4">
            {vacations.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl p-4 flex justify-between items-start"
              >
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {item.titleAr}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {item.titleFr}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {item.startDate} → {item.endDate}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingId
                  ? t("edit_vacation")
                  : t("add_vacation")}
              </h2>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input name="vacationtitlear" id="vacationtitlear"
                className="border rounded-xl p-3"
                placeholder={t("vacation_name_ar")}
                value={vacation.titleAr}
                onChange={(e) =>
                  setVacation({
                    ...vacation,
                    titleAr: e.target.value,
                  })
                }
              />
              <input name="vacationtitlefr" id="vacationtitlefr"
                className="border rounded-xl p-3"
                placeholder={t("vacation_name_fr")}
                value={vacation.titleFr}
                onChange={(e) =>
                  setVacation({
                    ...vacation,
                    titleFr: e.target.value,
                  })
                }
              />
              <input name="vacationstartda" id="vacationstartda"
                type="date"
                className="border rounded-xl p-3"
                value={vacation.startDate}
                onChange={(e) =>
                  setVacation({
                    ...vacation,
                    startDate: e.target.value,
                  })
                }
              />
              <input name="vacationenddate" id="vacationenddate"
                type="date"
                className="border rounded-xl p-3"
                value={vacation.endDate}
                onChange={(e) =>
                  setVacation({
                    ...vacation,
                    endDate: e.target.value,
                  })
                }
              />
              <textarea name="vacationdescrip" id="vacationdescrip"
                className="border rounded-xl p-3 col-span-2"
                rows={3}
                placeholder={t("description_ar")}
                value={vacation.descriptionAr}
                onChange={(e) =>
                  setVacation({
                    ...vacation,
                    descriptionAr: e.target.value,
                  })
                }
              />
              <textarea name="vacationdescrip" id="vacationdescrip"
                className="border rounded-xl p-3 col-span-2"
                rows={3}
                placeholder={t("description_fr")}
                value={vacation.descriptionFr}
                onChange={(e) =>
                  setVacation({
                    ...vacation,
                    descriptionFr: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="px-5 py-2 rounded-xl border"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isChecking}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isChecking ? "..." : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {warningModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold mb-2">
                {getWarningTitle()}
              </h2>
              <p className="text-slate-600 mb-6">
                {getWarningDesc()}
              </p>
              
              {warningType === "appointments" && (
                <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-xl mb-6 font-medium border border-amber-200">
                  {t("affected_appointments")} {affectedAppointments}
                </div>
              )}

              <button
                type="button"
                onClick={() => setWarningModalOpen(false)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
              >
                {t("ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}