const fs = require('fs');
const ar = JSON.parse(fs.readFileSync('src/locales/ar.json'));
const fr = JSON.parse(fs.readFileSync('src/locales/fr.json'));

const missingAr = {
  "confirm_delete_appointment_title": "حذف موعد",
  "confirm_delete_appointment_desc": "هل أنت متأكد أنك تريد حذف هذا الموعد؟ سيتم إزالته من النظام والمواعيد المتاحة.",
  "receptionists_manager": "إدارة موظفي الاستقبال",
  "add_new_user": "إضافة موظف استقبال",
  "name": "الاسم",
  "contact": "الاتصال",
  "receptionist_for": "الاستقبال للطبيب:",
  "no_users_found": "لا يوجد مستخدمين",
  "edit_user": "تعديل بيانات المستخدم",
  "select_doctor": "اختر الطبيب",
  "confirm_delete_doctor_title": "حذف طبيب",
  "confirm_delete_doctor_desc": "هل أنت متأكد أنك تريد حذف هذا الطبيب؟ سيتم حذف جميع البيانات المتعلقة به.",
  "inactive": "غير نشط",
  "book_another": "حجز موعد آخر",
  "receptionist_name_label": "الاستقبال",
  "clinic_location": "موقع العيادة"
};

const missingFr = {
  "confirm_delete_appointment_title": "Supprimer le rendez-vous",
  "confirm_delete_appointment_desc": "Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Il sera retiré du système et des créneaux disponibles.",
  "receptionists_manager": "Gestion des réceptionnistes",
  "add_new_user": "Ajouter un réceptionniste",
  "name": "Nom",
  "contact": "Contact",
  "receptionist_for": "Réceptionniste pour :",
  "no_users_found": "Aucun utilisateur trouvé",
  "edit_user": "Modifier les informations de l'utilisateur",
  "select_doctor": "Sélectionner un médecin",
  "confirm_delete_doctor_title": "Supprimer le médecin",
  "confirm_delete_doctor_desc": "Êtes-vous sûr de vouloir supprimer ce médecin ? Toutes ses données seront supprimées.",
  "inactive": "Inactif",
  "book_another": "Prendre un autre rendez-vous",
  "receptionist_name_label": "Réception",
  "clinic_location": "Emplacement de la clinique"
};

for (const key in missingAr) {
  if (!ar[key]) ar[key] = missingAr[key];
}

for (const key in missingFr) {
  if (!fr[key]) fr[key] = missingFr[key];
}

fs.writeFileSync('src/locales/ar.json', JSON.stringify(ar, null, 2));
fs.writeFileSync('src/locales/fr.json', JSON.stringify(fr, null, 2));
console.log("Translations updated 2");
