import React, { useState } from "react";
import { Doctor, DoctorVacation } from "../../types";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

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

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [vacation, setVacation] =
    useState<DoctorVacation>(emptyVacation);

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

  const handleSave = () => {
    if (
      !vacation.titleAr ||
      !vacation.titleFr ||
      !vacation.startDate ||
      !vacation.endDate
    ) {
      return;
    }

    let list = [...vacations];

    if (editingId) {
      list = list.map((v) =>
        v.id === editingId ? vacation : v
      );
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

              <input
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

              <input
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

              <input
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

              <input
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

              <textarea
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

              <textarea
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
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t("save")}
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
}