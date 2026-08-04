const fs = require('fs');

function patchJson(filePath, newKeys) {
  let content = fs.readFileSync(filePath, 'utf8');
  let data = JSON.parse(content);
  Object.assign(data, newKeys);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

patchJson('src/locales/ar.json', {
  "subscription_plans": "خطط الاشتراك",
  "subscription_subtitle": "اختر الخطة المناسبة لعيادتك واستمتع بجميع مزايا منصة صحتك أونلاين.",
  "plan_3_months": "🥉 خطة 3 أشهر",
  "plan_6_months": "🥈 خطة 6 أشهر",
  "plan_12_months": "🥇 خطة 12 شهرًا",
  "price_4000": "4000 دج",
  "price_6000": "6000 دج",
  "price_10000": "10000 دج",
  "free_15_days": "🎁 15 يومًا مجانيًا",
  "free_1_month": "🎁 شهر مجاني",
  "includes": "تشمل:",
  "feature_1": "إدارة المواعيد.",
  "feature_2": "التقويم الطبي.",
  "feature_3": "صفحة عامة للحجز.",
  "feature_4": "صفحة خاصة بالعيادة.",
  "feature_5": "إدارة الطاقم.",
  "feature_6": "البحث عن المرضى.",
  "feature_7": "تحديد موقع العيادة.",
  "feature_8": "دعم العربية والفرنسية.",
  "feature_9": "جميع تحديثات المنصة طوال مدة الاشتراك.",
  "includes_all_features": "تشمل جميع مزايا المنصة.",
  "subscribe_question": "هل ترغب في الاشتراك؟",
  "subscribe_contact_text": "للاشتراك أو للاستفسار، يرجى التواصل معنا عبر البريد الإلكتروني:"
});

patchJson('src/locales/fr.json', {
  "subscription_plans": "Plans d'abonnement",
  "subscription_subtitle": "Choisissez le plan adapté à votre clinique et profitez de toutes les fonctionnalités de la plateforme Sehatak Online.",
  "plan_3_months": "🥉 Plan 3 Mois",
  "plan_6_months": "🥈 Plan 6 Mois",
  "plan_12_months": "🥇 Plan 12 Mois",
  "price_4000": "4000 DA",
  "price_6000": "6000 DA",
  "price_10000": "10000 DA",
  "free_15_days": "🎁 15 jours gratuits",
  "free_1_month": "🎁 1 mois gratuit",
  "includes": "Comprend :",
  "feature_1": "Gestion des rendez-vous.",
  "feature_2": "Calendrier médical.",
  "feature_3": "Page publique de réservation.",
  "feature_4": "Page dédiée à la clinique.",
  "feature_5": "Gestion du personnel.",
  "feature_6": "Recherche de patients.",
  "feature_7": "Localisation de la clinique.",
  "feature_8": "Support Arabe et Français.",
  "feature_9": "Toutes les mises à jour pendant l'abonnement.",
  "includes_all_features": "Comprend toutes les fonctionnalités de la plateforme.",
  "subscribe_question": "Voulez-vous vous abonner ?",
  "subscribe_contact_text": "Pour vous abonner ou vous renseigner, veuillez nous contacter par email :"
});
console.log("Patched locales");
