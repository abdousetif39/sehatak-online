import re

with open('src/pages/admin/AdminSupportChat.tsx', 'r') as f:
    content = f.read()

old_list = """                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-900">{broadcast.recipientCount}</span>
                        <span>{t('recipients_count')}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-emerald-600">{broadcastStats[broadcast.id]?.delivered || 0}</span>
                        <span>{t('delivered_count')}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-blue-600">{broadcastStats[broadcast.id]?.read || 0}</span>
                        <span>{t('read_count')}</span>
                      </div>"""

new_list = """                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-900">{broadcast.recipientCount}</span>
                        <span>{t('recipients_count')}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-600">{broadcastStats[broadcast.id]?.sentOnly || 0}</span>
                        <span>{t('status_pending')}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-emerald-600">{broadcastStats[broadcast.id]?.delivered || 0}</span>
                        <span>{t('delivered_count')}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-blue-600">{broadcastStats[broadcast.id]?.read || 0}</span>
                        <span>{t('read_count')}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-amber-600">{broadcastStats[broadcast.id]?.unread || 0}</span>
                        <span>{t('unread_count')}</span>
                      </div>"""

content = content.replace(old_list, new_list)

with open('src/pages/admin/AdminSupportChat.tsx', 'w') as f:
    f.write(content)
