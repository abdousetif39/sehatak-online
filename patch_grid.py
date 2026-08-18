import re

with open('src/pages/admin/AdminSupportChat.tsx', 'r') as f:
    content = f.read()

old_grid = """              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-slate-900">{selectedBroadcast.recipientCount}</span>
                  <span className="text-sm text-slate-500">{t('recipients_count')}</span>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-emerald-600">{broadcastStats[selectedBroadcast.id]?.delivered || 0}</span>
                  <span className="text-sm text-emerald-700">{t('delivered_count')}</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-blue-600">{broadcastStats[selectedBroadcast.id]?.read || 0}</span>
                  <span className="text-sm text-blue-700">{t('read_count')}</span>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-amber-600">{(selectedBroadcast.recipientCount) - (broadcastStats[selectedBroadcast.id]?.read || 0)}</span>
                  <span className="text-sm text-amber-700">{t('unread_count')}</span>
                </div>
              </div>"""

new_grid = """              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-slate-900">{selectedBroadcast.recipientCount}</span>
                  <span className="text-sm text-slate-500">{t('recipients_count')}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-slate-600">{broadcastStats[selectedBroadcast.id]?.sentOnly || 0}</span>
                  <span className="text-sm text-slate-500">{t('status_pending')}</span>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-emerald-600">{broadcastStats[selectedBroadcast.id]?.delivered || 0}</span>
                  <span className="text-sm text-emerald-700">{t('delivered_count')}</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-blue-600">{broadcastStats[selectedBroadcast.id]?.read || 0}</span>
                  <span className="text-sm text-blue-700">{t('read_count')}</span>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-amber-600">{broadcastStats[selectedBroadcast.id]?.unread || 0}</span>
                  <span className="text-sm text-amber-700">{t('unread_count')}</span>
                </div>
              </div>"""

content = content.replace(old_grid, new_grid)

with open('src/pages/admin/AdminSupportChat.tsx', 'w') as f:
    f.write(content)
