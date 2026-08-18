const fs = require('fs');

let content = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');

const handlerRegex = /const handleCurrentLocation = \(\) => \{/;
const handlerToAdd = `const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t('all_fields_required', 'يرجى ملء جميع الحقول'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwords_do_not_match', 'كلمات المرور الجديدة غير متطابقة'));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t('password_too_short', 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل'));
      return;
    }

    setChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      if (auth.currentUser && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
        setPasswordSuccess(t('password_changed_successfully', 'تم تغيير كلمة المرور بنجاح'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setPasswordError(t('current_password_incorrect', 'كلمة المرور الحالية غير صحيحة'));
      } else {
        setPasswordError(err.message);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCurrentLocation = () => {`;

if (content.match(handlerRegex)) {
  content = content.replace(handlerRegex, handlerToAdd);
  fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', content);
  console.log("Success replacing handler");
} else {
  console.log("Could not find handleCurrentLocation");
}

