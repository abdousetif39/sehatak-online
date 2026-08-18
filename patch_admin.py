import re

with open('src/pages/admin/AdminSupportChat.tsx', 'r') as f:
    content = f.read()

# Add Delete button to the broadcast card
old_card = """                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-slate-900 line-clamp-1">{broadcast.title}</h3>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap">
                        {format(new Date(broadcast.sentAt), 'yyyy-MM-dd HH:mm')}
                      </span>
                    </div>"""

new_card = """                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedBroadcast(broadcast); setShowDeleteBroadcastConfirm(true); }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('delete_broadcast_record')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <h3 className="font-bold text-slate-900 line-clamp-1">{broadcast.title}</h3>
                      </div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap">
                        {format(new Date(broadcast.sentAt), 'yyyy-MM-dd HH:mm')}
                      </span>
                    </div>"""

content = content.replace(old_card, new_card)

# Add Confirm Modal at the end of the return statement
old_modal = """      <MessageModal
        isOpen={messageModal.open}"""

new_modal = """      {showDeleteBroadcastConfirm && selectedBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('confirm_delete_broadcast_record')}</h3>
              <p className="text-sm text-slate-500 mb-6">{t('confirm_delete_broadcast_desc')}</p>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3">
              <button
                onClick={() => { setShowDeleteBroadcastConfirm(false); setSelectedBroadcast(null); }}
                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteBroadcast}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      <MessageModal
        isOpen={messageModal.open}"""

content = content.replace(old_modal, new_modal)

with open('src/pages/admin/AdminSupportChat.tsx', 'w') as f:
    f.write(content)
