import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export default function MessageModal({
  isOpen,
  onClose,
  type = 'info',
  title,
  message,
}: MessageModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const styles = {
    success: {
      icon: <CheckCircle className="w-7 h-7 text-green-600" />,
      bg: "bg-green-100",
      button: "bg-green-600 hover:bg-green-700",
    },
    error: {
      icon: <AlertCircle className="w-7 h-7 text-red-600" />,
      bg: "bg-red-100",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: <AlertTriangle className="w-7 h-7 text-yellow-600" />,
      bg: "bg-yellow-100",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      icon: <Info className="w-7 h-7 text-blue-600" />,
      bg: "bg-blue-100",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const current = styles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${current.bg}`}>
            {current.icon}
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-2 text-slate-500">
            {message}
          </p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-colors ${current.button}`}
          >
            {t('ok')}
          </button>
        </div>
      </div>
    </div>
  );
}