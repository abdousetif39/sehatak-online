const fs = require('fs');
function patchJson(filePath, newKeys) {
  let content = fs.readFileSync(filePath, 'utf8');
  let data = JSON.parse(content);
  Object.assign(data, newKeys);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

patchJson('src/locales/ar.json', {
  "share_call_to_action": "ساهم في وصول المنصة إلى أكبر عدد من الأطباء والمرضى.",
  "copy_link": "نسخ الرابط",
  "link_copied_success": "✅ شكرًا لمشاركتك منصة صحتك أونلاين. تم نسخ الرابط بنجاح"
});

patchJson('src/locales/fr.json', {
  "share_call_to_action": "Contribuez à faire connaître la plateforme au plus grand nombre de médecins et de patients.",
  "copy_link": "Copier le lien",
  "link_copied_success": "✅ Merci de partager la plateforme Sehatak Online. Le lien a été copié avec succès."
});
console.log("Patched locales");
