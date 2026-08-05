import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { COLLECTIONS } from '../lib/constants';
import { doc, getDoc } from 'firebase/firestore';
import { Lock, Mail, Loader2, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Navigate, Link, useNavigate } from 'react-router-dom';
export default function AuthLayout() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'fr' : 'ar';
    i18n.changeLanguage(newLang);
  };

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/doctor'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userCred.user.uid));
      
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'doctor' || role === 'receptionist') navigate('/doctor');
      } else {
        setError(t('error_account_not_found'));
        await auth.signOut();
      }
    } catch (err: any) {
      if (err.code !== 'auth/invalid-credential' && err.code !== 'auth/user-not-found' && err.code !== 'auth/wrong-password') {
        console.error(err);
      }
      if (err.code === 'auth/operation-not-allowed') {
        setError(t('error_email_auth_disabled'));
      } else {
        setError(t('error_invalid_credentials'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative">
      <div className="absolute top-4 right-4 ltr:right-4 ltr:left-auto rtl:left-4 rtl:right-auto">
        <button onClick={toggleLanguage} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white shadow-sm border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-full">
          <Globe className="w-4 h-4" />
          {i18n.language === 'ar' ? t('language_fr') : t('language_ar')}
        </button>
      </div>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
          <Link to="/">
          <img
          src="/logo.webp"
            width="224"
            height="72"
          alt="Sehatek Online Logo"
          className="h-18 w-auto object-contain cursor-pointer"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          </Link>
</div>
          <h1 className="text-2xl font-bold text-slate-800">{t('login_title')}</h1>
          <p className="text-slate-500 mt-2">
            {t('login_subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('email')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pr-10 pl-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm bg-slate-50 focus:bg-white transition-colors text-left"
                placeholder={t('email_placeholder')}
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pr-10 pl-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm bg-slate-50 focus:bg-white transition-colors text-left"
                placeholder={t('password_placeholder')}
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('login_button')}
          </button>
        </form>
      </div>
    </div>
  );
}

