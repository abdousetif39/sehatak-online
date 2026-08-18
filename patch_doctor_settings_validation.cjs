const fs = require('fs');

let content = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');

// Add validation to handleSubmit
const newSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    // Sync backward compatibility fields
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');

    const arabicRegex = /^[\\u0600-\\u06FF\\s'-]+$/;
    const latinRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\\s'-]+$/;

    if (formData.firstNameAr && !arabicRegex.test(formData.firstNameAr)) {
      setError(t('arabic_only_first_name', 'يرجى إدخال حروف عربية فقط في الاسم (عربي)'));
      setSaving(false);
      return;
    }
    if (formData.lastNameAr && !arabicRegex.test(formData.lastNameAr)) {
      setError(t('arabic_only_last_name', 'يرجى إدخال حروف عربية فقط في اللقب (عربي)'));
      setSaving(false);
      return;
    }
    if (formData.firstNameFr && !latinRegex.test(formData.firstNameFr)) {
      setError(t('latin_only_first_name', 'Please enter Latin characters only in First Name (French)'));
      setSaving(false);
      return;
    }
    if (formData.lastNameFr && !latinRegex.test(formData.lastNameFr)) {
      setError(t('latin_only_last_name', 'Please enter Latin characters only in Last Name (French)'));
      setSaving(false);
      return;
    }

    try {`;

content = content.replace(
  "const handleSubmit = async (e: React.FormEvent) => {\n    // Sync backward compatibility fields\n    e.preventDefault();\n    if (!user) return;\n    setSaving(true);\n    try {",
  newSubmit
);

// Remove pattern and title from inputs
content = content.replace(/ pattern="[^"]+"/g, "");
content = content.replace(/ title="[^"]+"/g, "");

fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', content);
