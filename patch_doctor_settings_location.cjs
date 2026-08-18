const fs = require('fs');

let content = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');

// Replacements
content = content.replace(/t\('geolocation_not_supported', 'تحديد الموقع غير مدعوم في متصفحك'\)/g, "t('geolocation_not_supported')");
content = content.replace(/t\('geolocation_error', 'تعذر تحديد الموقع تلقائياً. يمكنك اختيار الموقع يدويًا من الخريطة.'\)/g, "t('geolocation_error')");
content = content.replace(/t\('geolocation_denied', 'تم رفض الإذن لتحديد الموقع. يرجى تفعيل الإذن أو تحديد الموقع يدويًا من الخريطة.'\)/g, "t('geolocation_denied')");
content = content.replace(/t\('geolocation_timeout', 'انتهت مهلة تحديد الموقع. يرجى المحاولة مرة أخرى أو اختيار الموقع من الخريطة.'\)/g, "t('geolocation_timeout')");
content = content.replace(/t\('locating', 'جاري تحديد الموقع\.\.\.'\)/g, "t('locating')");
content = content.replace(/t\('use_current_location', 'استخدام موقعي الحالي'\)/g, "t('use_current_location')");
content = content.replace(/t\('choose_from_map', 'اختيار الموقع من الخريطة'\)/g, "t('choose_from_map')");
content = content.replace(/t\('location_selected', 'تم تحديد الموقع بنجاح'\)/g, "t('location_selected')");
content = content.replace(/t\('clinic_location', 'موقع العيادة على الخريطة'\)/g, "t('clinic_location')");

fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', content);
console.log("Success replacing in DoctorSettings.tsx");
