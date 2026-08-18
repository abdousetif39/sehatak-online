const fs = require('fs');

let content = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');

const securitySection = `
      {/* Security Settings */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mt-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800">{t('security', 'الأمان')}</h2>
        </div>

        {passwordError && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-xl text-sm">
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('current_password', 'كلمة المرور الحالية')}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('new_password', 'كلمة المرور الجديدة')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('confirm_new_password', 'تأكيد كلمة المرور الجديدة')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
              required
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {changingPassword && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {t('change_password', 'تغيير كلمة المرور')}
            </button>
          </div>
        </form>
      </div>
`;

const replaceIndex = content.lastIndexOf('</form>');
if (replaceIndex !== -1) {
  content = content.substring(0, replaceIndex + 7) + '\n' + securitySection + content.substring(replaceIndex + 7);
  fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', content);
  console.log("Success replacing UI.");
} else {
  console.log("Could not find </form>");
}
