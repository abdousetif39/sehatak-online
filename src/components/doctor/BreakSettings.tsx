import React from "react";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Doctor } from "../../types";

interface Props {
  formData: Partial<Doctor>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Doctor>>>;
}

const DAYS = [
  { id: 6, label: "day_6" },
  { id: 0, label: "day_0" },
  { id: 1, label: "day_1" },
  { id: 2, label: "day_2" },
  { id: 3, label: "day_3" },
  { id: 4, label: "day_4" },
  { id: 5, label: "day_5" },
];

export default function BreakSettings({
  formData,
  setFormData,
}: Props) {
  const { t } = useTranslation();

  const toggleMain = () => {
    setFormData(prev => ({
      ...prev,
      breakEnabled: !prev.breakEnabled,
    }));
  };

  const updateBreak = (
    key: "morningBreak" | "lunchBreak" | "eveningBreak",
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        enabled: false,
        start: "",
        end: "",
        days: [],
        ...(prev[key] || {}),
        [field]: value,
      },
    }));
  };

  const toggleDay = (
    key: "morningBreak" | "lunchBreak" | "eveningBreak",
    day: number
  ) => {
    const current = formData[key]?.days || [];

    updateBreak(
      key,
      "days",
      current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
    );
  };

  const renderBreak = (
    title: string,
    key: "morningBreak" | "lunchBreak" | "eveningBreak"
  ) => (
    <div className="border rounded-xl p-4 mt-5">

      <label htmlFor="field_691304" className="flex items-center gap-3 mb-4">
        <input name="field_691304" id="field_691304"
          type="checkbox"
          checked={formData[key]?.enabled || false}
          onChange={e =>
            updateBreak(key, "enabled", e.target.checked)
          }
        />

        <span className="font-semibold">{title}</span>
      </label>

      {formData[key]?.enabled && (
        <>
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label htmlFor="formdatakeystar" className="block mb-2">
                {t("from")}
              </label>

              <input name="formdatakeystar" id="formdatakeystar"
                type="time"
                value={formData[key]?.start || ""}
                onChange={e =>
                  updateBreak(key, "start", e.target.value)
                }
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label htmlFor="formdatakeyend" className="block mb-2">
                {t("to")}
              </label>

              <input name="formdatakeyend" id="formdatakeyend"
                type="time"
                value={formData[key]?.end || ""}
                onChange={e =>
                  updateBreak(key, "end", e.target.value)
                }
                className="w-full border rounded-lg p-2"
              />
            </div>

          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {DAYS.map(day => (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(key, day.id)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  formData[key]?.days?.includes(day.id)
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100"
                }`}
              >
                {t(day.label)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl border mt-6">

      <div className="flex items-center gap-3 mb-6">

        <div className="p-2 bg-orange-100 rounded-lg">
          <Clock className="w-5 h-5" />
        </div>

        <h2 className="font-bold text-lg">
          {t("break_time")}
        </h2>

      </div>

      <label htmlFor="field_876833" className="flex items-center gap-3">
        <input name="field_876833" id="field_876833"
          type="checkbox"
          checked={formData.breakEnabled || false}
          onChange={toggleMain}
        />

        <span>
          {t("enable_breaks")}
        </span>
      </label>

      {formData.breakEnabled && (
        <>
          {renderBreak(
            t("morning_break"),
            "morningBreak"
          )}

          {renderBreak(
            t("lunch_break"),
            "lunchBreak"
          )}

          {renderBreak(
            t("evening_break"),
            "eveningBreak"
          )}
        </>
      )}

    </div>
  );
}