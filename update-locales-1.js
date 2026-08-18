const fs = require('fs');

const arPath = 'src/locales/ar.json';
const frPath = 'src/locales/fr.json';

const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

// Auth keys
ar.login_title = "تسجيل الدخول";
fr.login_title = "Connexion";

ar.login_subtitle = "للوصول إلى لوحة التحكم الخاصة بك";
fr.login_subtitle = "Pour accéder à votre tableau de bord";

ar.email = "البريد الإلكتروني";
fr.email = "E-mail";

ar.password = "كلمة المرور";
fr.password = "Mot de passe";

ar.login_button = "تسجيل الدخول";
fr.login_button = "Se connecter";

ar.email_placeholder = "أدخل بريدك الإلكتروني";
fr.email_placeholder = "Entrez votre e-mail";

ar.password_placeholder = "أدخل كلمة المرور";
fr.password_placeholder = "Entrez votre mot de passe";

ar.error_invalid_credentials = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
fr.error_invalid_credentials = "E-mail ou mot de passe incorrect";

ar.error_account_not_found = "لا يوجد حساب مسجل بهذه البيانات";
fr.error_account_not_found = "Aucun compte trouvé avec ces identifiants";

ar.error_email_auth_disabled = "تسجيل الدخول بالبريد الإلكتروني معطل. يرجى تفعيله من لوحة تحكم Firebase (Authentication -> Sign-in method -> Email/Password).";
fr.error_email_auth_disabled = "La connexion par e-mail est désactivée. Veuillez l'activer dans le tableau de bord Firebase (Authentication -> Sign-in method -> Email/Password).";

ar.loading = "جاري التحميل...";
fr.loading = "Chargement...";

// Doctor Profile keys
ar.doctor_not_found = "الطبيب غير موجود";
fr.doctor_not_found = "Médecin introuvable";

ar.booking_confirmed_title = "تم تأكيد الحجز بنجاح!";
fr.booking_confirmed_title = "Réservation confirmée avec succès !";

ar.booking_details = "تم حجز موعدك مع د. {{doctorName}} يوم {{date}} الساعة {{time}}.";
fr.booking_details = "Votre rendez-vous avec le Dr {{doctorName}} est confirmé pour le {{date}} à {{time}}.";

ar.back_to_home = "العودة للرئيسية";
fr.back_to_home = "Retour à l'accueil";

ar.go_back = "العودة للخلف";
fr.go_back = "Retour";

ar.dr_prefix = "د. ";
fr.dr_prefix = "Dr ";

ar.choose_appointment = "اختر موعداً";
fr.choose_appointment = "Choisissez un rendez-vous";

ar.step_1_day = "1. اختر اليوم";
fr.step_1_day = "1. Choisissez le jour";

ar.step_2_time = "2. اختر الوقت";
fr.step_2_time = "2. Choisissez l'heure";

ar.step_3_patient = "3. بيانات المريض";
fr.step_3_patient = "3. Données du patient";

ar.no_appointments_available = "لا يوجد مواعيد متاحة في هذا اليوم";
fr.no_appointments_available = "Aucun rendez-vous disponible pour ce jour";

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2));
console.log('Locales updated successfully');
