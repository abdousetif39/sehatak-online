const fs = require('fs');

function patchJson(filePath, newKeys) {
  let content = fs.readFileSync(filePath, 'utf8');
  let data = JSON.parse(content);
  Object.assign(data, newKeys);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

patchJson('src/locales/ar.json', {
  "share_title": "شارك منصة صحتك أونلاين",
  "share_desc": "ساعد الأطباء والمرضى على اكتشاف منصة صحتك أونلاين من خلال مشاركة الموقع على مواقع التواصل الاجتماعي.",
  "share_msg_title": "صحتك أونلاين",
  "share_msg_desc": "منصة متكاملة لإدارة العيادات الطبية وحجز المواعيد عبر الإنترنت.",
  "share_msg_features": "أبرز المزايا",
  "share_msg_doctors": "للأطباء",
  "share_feature_d1": "إدارة المواعيد بسهولة.",
  "share_feature_d2": "تقويم طبي متكامل.",
  "share_feature_d3": "صفحة عامة للحجز.",
  "share_feature_d4": "إدارة موظفي الاستقبال.",
  "share_feature_d5": "البحث عن المرضى.",
  "share_feature_d6": "تحديد موقع العيادة على الخريطة.",
  "share_feature_d7": "دعم اللغتين العربية والفرنسية.",
  "share_msg_patients": "للمرضى",
  "share_feature_p1": "البحث عن الطبيب.",
  "share_feature_p2": "حجز المواعيد عبر الإنترنت.",
  "share_feature_p3": "معرفة موقع العيادة.",
  "share_feature_p4": "معرفة أوقات العمل.",
  "share_feature_p5": "الاطلاع على معلومات الطبيب بسهولة."
});

patchJson('src/locales/fr.json', {
  "share_title": "Partagez la plateforme Sehatak Online",
  "share_desc": "Aidez les médecins et les patients à découvrir la plateforme Sehatak Online en partageant le site sur les réseaux sociaux.",
  "share_msg_title": "Sehatak Online",
  "share_msg_desc": "Une plateforme complète pour la gestion des cliniques médicales et la réservation de rendez-vous en ligne.",
  "share_msg_features": "Principales fonctionnalités",
  "share_msg_doctors": "Pour les médecins",
  "share_feature_d1": "Gestion facile des rendez-vous.",
  "share_feature_d2": "Calendrier médical intégré.",
  "share_feature_d3": "Page publique de réservation.",
  "share_feature_d4": "Gestion du personnel.",
  "share_feature_d5": "Recherche de patients.",
  "share_feature_d6": "Localisation de la clinique sur la carte.",
  "share_feature_d7": "Support de l'arabe et du français.",
  "share_msg_patients": "Pour les patients",
  "share_feature_p1": "Recherche de médecins.",
  "share_feature_p2": "Prise de rendez-vous en ligne.",
  "share_feature_p3": "Connaître l'emplacement de la clinique.",
  "share_feature_p4": "Connaître les heures de travail.",
  "share_feature_p5": "Accéder facilement aux informations du médecin."
});
console.log("Patched locales for share");
