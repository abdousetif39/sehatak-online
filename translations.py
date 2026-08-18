import json

ar_path = 'src/locales/ar.json'
fr_path = 'src/locales/fr.json'

with open(ar_path, 'r', encoding='utf-8') as f:
    ar = json.load(f)

with open(fr_path, 'r', encoding='utf-8') as f:
    fr = json.load(f)

new_keys = {
    'broadcast_details': {'ar': 'تفاصيل الرسالة الجماعية', 'fr': 'Détails du message groupé'},
    'delete_record': {'ar': 'حذف السجل', 'fr': 'Supprimer l\'historique'},
    'confirm_delete_broadcast_record': {'ar': 'تأكيد الحذف', 'fr': 'Confirmer la suppression'},
    'confirm_delete_broadcast_desc': {'ar': 'هل أنت متأكد من حذف سجل هذه الرسالة الجماعية؟ سيتم حذف سجل الإرسال من قائمة الإدارة، ولن يؤثر ذلك على الرسائل الموجودة داخل محادثات الأطباء.', 'fr': 'Êtes-vous sûr de vouloir supprimer cet historique ? Cela supprimera l\'enregistrement de la liste d\'administration, mais n\'affectera pas les messages dans les conversations des médecins.'},
    'delivered_count': {'ar': 'تم الاستلام', 'fr': 'Reçu'},
    'unread_count': {'ar': 'لم تتم القراءة', 'fr': 'Non lu'},
    'recipient_status': {'ar': 'الحالة', 'fr': 'Statut'},
    'recipient_time_delivered': {'ar': 'وقت الاستلام', 'fr': 'Heure de réception'},
    'recipient_time_read': {'ar': 'وقت القراءة', 'fr': 'Heure de lecture'},
    'recipient_time_replied': {'ar': 'وقت الرد', 'fr': 'Heure de réponse'},
    'status_pending': {'ar': 'تم الإرسال', 'fr': 'Envoyé'},
    'delete_failed': {'ar': 'فشل الحذف', 'fr': 'Échec de la suppression'},
    'delete_success': {'ar': 'تم الحذف بنجاح', 'fr': 'Supprimé avec succès'},
    'retry': {'ar': 'إعادة المحاولة', 'fr': 'Réessayer'}
}

for k, v in new_keys.items():
    ar[k] = v['ar']
    fr[k] = v['fr']

with open(ar_path, 'w', encoding='utf-8') as f:
    json.dump(ar, f, ensure_ascii=False, indent=2)

with open(fr_path, 'w', encoding='utf-8') as f:
    json.dump(fr, f, ensure_ascii=False, indent=2)

print("Translations updated")
