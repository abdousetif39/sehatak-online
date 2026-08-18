import json

files = ['src/locales/ar.json', 'src/locales/fr.json']
keys_to_add = {
    'ar': {
        "delete_message": "حذف من عندي",
        "delete_for_everyone": "حذف للجميع",
        "chat_confirm_delete_message": "هل أنت متأكد من حذف هذه الرسالة؟",
        "message_has_been_deleted": "تم حذف هذه الرسالة",
        "delete_broadcast_record": "حذف السجل",
        "confirm_delete_broadcast_record": "حذف سجل الرسالة الجماعية",
        "confirm_delete_broadcast_desc": "هل أنت متأكد من حذف هذا السجل؟ سيتم حذفه من الإدارة فقط، ولن يتم حذفه من محادثات الأطباء.",
        "message_sent": "تم الإرسال",
        "message_delivered": "تم الاستلام",
        "message_read": "تمت القراءة",
        "delete": "حذف",
        "delete_failed": "فشل الحذف",
        "status_pending": "تم الإرسال"
    },
    'fr': {
        "delete_message": "Supprimer pour moi",
        "delete_for_everyone": "Supprimer pour tous",
        "chat_confirm_delete_message": "Voulez-vous vraiment supprimer ce message ?",
        "message_has_been_deleted": "Ce message a été supprimé",
        "delete_broadcast_record": "Supprimer l'historique",
        "confirm_delete_broadcast_record": "Supprimer l'historique de diffusion",
        "confirm_delete_broadcast_desc": "Voulez-vous vraiment supprimer cet historique ? Il sera supprimé pour l'administration uniquement, pas pour les médecins.",
        "message_sent": "Envoyé",
        "message_delivered": "Distribué",
        "message_read": "Lu",
        "delete": "Supprimer",
        "delete_failed": "Échec de la suppression",
        "status_pending": "Envoyé"
    }
}

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    lang = 'ar' if 'ar.json' in f else 'fr'
    for k, v in keys_to_add[lang].items():
        if k not in data:
            data[k] = v
        # override some to ensure correct translations
        if k in ["delete_message", "delete_for_everyone", "chat_confirm_delete_message", "message_has_been_deleted", "delete_broadcast_record", "confirm_delete_broadcast_record", "confirm_delete_broadcast_desc"]:
            data[k] = v

    with open(f, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=2)

