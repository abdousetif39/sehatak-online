import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, X } from 'lucide-react';

interface DeleteMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone?: () => void;
  isMe: boolean;
  loading?: boolean;
}

export default function DeleteMessageModal({
  isOpen,
  onClose,
  onDeleteForMe,
  onDeleteForEveryone,
  isMe,
  loading = false
}: DeleteMessageModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {t('delete_message_title', 'Delete Message')}
          </h2>
          <p className="text-slate-500">
            {t('delete_message_desc', 'Are you sure you want to delete this message?')}
          </p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {t('cancel', 'Cancel')}
          </button>
          <button
            onClick={onDeleteForMe}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {t('delete_for_me', 'Delete for me')}
          </button>
          {isMe && onDeleteForEveryone && (
            <button
              onClick={onDeleteForEveryone}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {t('delete_for_everyone', 'Delete for everyone')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
