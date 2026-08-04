const fs = require('fs');
const ar = JSON.parse(fs.readFileSync('src/locales/ar.json'));
const fr = JSON.parse(fs.readFileSync('src/locales/fr.json'));

const missingAr = {
  "confirm_delete_title": "تأكيد الحذف",
  "confirm_delete_message": "هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
  "confirm_delete_button": "نعم، احذف",
  "patients_search_title": "البحث عن المرضى",
  "menu_staff_manager": "إدارة الحسابات",
  "access_denied": "ليس لديك صلاحية للوصول إلى هذه الصفحة",
  "prev_week": "السابق",
  "next_week": "التالي",
  "fully_booked": "محجوز",
  "last_spot": "آخر مكان",
  "today": "اليوم",
  "open_in_google_maps": "فتح في خرائط جوجل",
  "error_no_time": "يرجى اختيار وقت الموعد أولاً"
};

const missingFr = {
  "confirm_delete_title": "Confirmer la suppression",
  "confirm_delete_message": "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
  "confirm_delete_button": "Oui, supprimer",
  "patients_search_title": "Rechercher des patients",
  "menu_staff_manager": "Gestion du personnel",
  "access_denied": "Vous n'avez pas l'autorisation d'accéder à cette page",
  "prev_week": "Précédent",
  "next_week": "Suivant",
  "fully_booked": "Complet",
  "last_spot": "Dernière place",
  "today": "Aujourd'hui",
  "open_in_google_maps": "Ouvrir dans Google Maps",
  "error_no_time": "Veuillez d'abord choisir l'heure du rendez-vous"
};

for (const key in missingAr) {
  if (!ar[key]) ar[key] = missingAr[key];
}

for (const key in missingFr) {
  if (!fr[key]) fr[key] = missingFr[key];
}

fs.writeFileSync('src/locales/ar.json', JSON.stringify(ar, null, 2));
fs.writeFileSync('src/locales/fr.json', JSON.stringify(fr, null, 2));
console.log("Translations updated");
