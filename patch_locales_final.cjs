const fs = require('fs');

let ar = JSON.parse(fs.readFileSync('src/locales/ar.json', 'utf8'));
ar['slugs_updated_success'] = 'تم تحديث {{count}} رابط طبيب';
ar['updating'] = 'جاري التحديث...';
ar['fix_slugs'] = 'إصلاح الروابط (Slugs)';
ar['reason_label'] = 'السبب: ';
ar['everyday'] = 'كل الأيام';
ar['comma_separator'] = '، ';
ar['confirm_delete_receptionist_title'] = 'حذف حساب موظف الاستقبال';
ar['confirm_delete_receptionist_desc'] = 'هل أنت متأكد أنك تريد حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.';
fs.writeFileSync('src/locales/ar.json', JSON.stringify(ar, null, 2));

let fr = JSON.parse(fs.readFileSync('src/locales/fr.json', 'utf8'));
fr['slugs_updated_success'] = '{{count}} liens de médecins mis à jour';
fr['updating'] = 'Mise à jour en cours...';
fr['fix_slugs'] = 'Réparer les liens (Slugs)';
fr['reason_label'] = 'Motif : ';
fr['everyday'] = 'Tous les jours';
fr['comma_separator'] = ', ';
fr['confirm_delete_receptionist_title'] = 'Supprimer le compte du réceptionniste';
fr['confirm_delete_receptionist_desc'] = 'Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.';
fs.writeFileSync('src/locales/fr.json', JSON.stringify(fr, null, 2));

console.log("Patched locales!");
