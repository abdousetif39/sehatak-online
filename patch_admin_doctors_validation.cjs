const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

const newSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const arabicRegex = /^[\\u0600-\\u06FF\\s'-]+$/;
    const latinRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\\s'-]+$/;

    if (firstNameAr && !arabicRegex.test(firstNameAr)) {
      setError(t('arabic_only_first_name', 'يرجى إدخال حروف عربية فقط في الاسم (عربي)'));
      setLoading(false);
      return;
    }
    if (lastNameAr && !arabicRegex.test(lastNameAr)) {
      setError(t('arabic_only_last_name', 'يرجى إدخال حروف عربية فقط في اللقب (عربي)'));
      setLoading(false);
      return;
    }
    if (firstNameFr && !latinRegex.test(firstNameFr)) {
      setError(t('latin_only_first_name', 'Please enter Latin characters only in First Name (French)'));
      setLoading(false);
      return;
    }
    if (lastNameFr && !latinRegex.test(lastNameFr)) {
      setError(t('latin_only_last_name', 'Please enter Latin characters only in Last Name (French)'));
      setLoading(false);
      return;
    }

    try {`;

content = content.replace(
  "const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setLoading(true);\n    setError('');\n    try {",
  newSubmit
);

// Remove pattern and title from inputs
content = content.replace(/ pattern="[^"]+"/g, "");
content = content.replace(/ title="[^"]+"/g, "");

fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', content);
