const fs = require('fs');

const arLocales = JSON.parse(fs.readFileSync('src/locales/ar.json', 'utf8'));
const frLocales = JSON.parse(fs.readFileSync('src/locales/fr.json', 'utf8'));

const extractedAr = JSON.parse(fs.readFileSync('extracted_ar.json', 'utf8'));
const extractedFr = JSON.parse(fs.readFileSync('extracted_fr.json', 'utf8'));

// Basic French translations for the new keys to keep the fr.json useful
const basicFrTranslations = {
  "menu_receptionists": "Gestion de la réception",
  "error_account_not_found": "Aucun compte trouvé avec ces informations",
  "error_email_auth_disabled": "L'authentification par e-mail est désactivée.",
  "error_invalid_credentials": "E-mail ou mot de passe incorrect",
  "login_title": "Connexion",
  "login_subtitle": "Accédez à votre tableau de bord",
  "email": "E-mail",
  "email_placeholder": "Entrez votre e-mail",
  "password": "Mot de passe",
  "password_placeholder": "Entrez votre mot de passe",
  "login_button": "Se connecter",
  "patients_search_title": "Recherche de patients",
  "menu_staff_manager": "Gestion des comptes",
  "access_denied": "Vous n'avez pas l'autorisation d'accéder à cette page",
  "confirm_delete_doctor_title": "Supprimer un médecin",
  "confirm_delete_doctor_desc": "Êtes-vous sûr de vouloir supprimer ce médecin ?",
  "name": "Nom",
  "contact": "Contact",
  "inactive": "Inactif",
  "no_users_found": "Aucun utilisateur trouvé",
  "arabic_only_first_name": "Veuillez entrer uniquement des caractères arabes dans le prénom (Arabe)",
  "arabic_only_last_name": "Veuillez entrer uniquement des caractères arabes dans le nom (Arabe)",
  "select_state": "Sélectionner la wilaya",
  "select_city": "Sélectionner la commune",
  "doctor_on_vacation": "En congé",
  "time": "Heure",
  "patient_name": "Nom",
  "patient_last_name": "Prénom",
  "phone": "Numéro de téléphone",
  "file_number": "Numéro de dossier (Optionnel)",
  "all_fields_required": "Veuillez remplir tous les champs",
  "passwords_do_not_match": "Les nouveaux mots de passe ne correspondent pas",
  "password_too_short": "Le mot de passe doit comporter au moins 6 caractères",
  "password_changed_successfully": "Mot de passe modifié avec succès",
  "current_password_incorrect": "Mot de passe actuel incorrect",
  "menu_clinic_settings": "Paramètres de la clinique",
  "personal_info": "Informations personnelles",
  "photo_url": "Lien de la photo",
  "preview_image": "Aperçu de l'image",
  "first_name_ar": "Prénom (Arabe)",
  "last_name_ar": "Nom (Arabe)",
  "first_name_fr": "Prénom (Français)",
  "last_name_fr": "Nom (Français)",
  "specialty_ar": "Spécialité (Arabe)",
  "specialty_fr": "Spécialité (Français)",
  "receptionist_name": "Nom de la réceptionniste",
  "enter_receptionist_name": "Entrez le nom de la réceptionniste...",
  "clinic_name_ar": "Nom de la clinique (Arabe)",
  "clinic_name_fr": "Nom de la clinique (Français)",
  "state": "Wilaya",
  "city": "Commune",
  "address": "Adresse détaillée",
  "confirm": "Confirmer",
  "working_hours": "Heures de travail",
  "working_days": "Jours de travail",
  "start_time": "Heure de début",
  "end_time": "Heure de fin",
  "appointment_duration": "Durée du rendez-vous (en minutes)",
  "save_changes": "Enregistrer les modifications",
  "security": "Sécurité",
  "current_password": "Mot de passe actuel",
  "new_password": "Nouveau mot de passe",
  "confirm_new_password": "Confirmer le nouveau mot de passe",
  "change_password": "Changer le mot de passe",
  "search": "Recherche",
  "email_in_use": "Cet e-mail est déjà utilisé.",
  "no_appointments_available": "Aucun rendez-vous disponible pour le moment",
  "book_appointment": "Réserver maintenant",
  "booking_error": "Une erreur est survenue lors de la réservation",
  "receptionist_name_label": "Réception"
};

Object.keys(extractedAr).forEach(key => {
  if (!arLocales[key]) {
    arLocales[key] = extractedAr[key];
  }
  if (!frLocales[key]) {
    frLocales[key] = basicFrTranslations[key] || extractedAr[key];
  }
});

Object.keys(extractedFr).forEach(key => {
  if (!frLocales[key]) {
    frLocales[key] = extractedFr[key];
  }
  if (!arLocales[key]) {
    arLocales[key] = extractedFr[key]; // fallback
  }
});

fs.writeFileSync('src/locales/ar.json', JSON.stringify(arLocales, null, 2) + '\n');
fs.writeFileSync('src/locales/fr.json', JSON.stringify(frLocales, null, 2) + '\n');
console.log("Locales merged.");
