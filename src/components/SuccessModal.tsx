import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function SuccessModal({
  isOpen,
  title,
  message,
  onClose,
}: SuccessModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />

          <h2 className="text-xl font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-3 text-slate-600">
            {message}
          </p>

          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
          >
            {t("ok")}
          </button>
        </div>
      </div>
    </div>
  );
}