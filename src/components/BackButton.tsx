import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BackButton() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition"
    >
      <ArrowLeft
        className={`w-5 h-5 ${
          i18n.language === "ar" ? "rotate-180" : ""
        }`}
      />
      <span>{t("back")}</span>
    </button>
  );
}