import { Routes, Route, Link } from 'react-router-dom';
import Home from './public/Home';
import React, { Suspense } from 'react';
const DoctorProfile = React.lazy(() => import('./public/DoctorProfile'));
const Pricing = React.lazy(() => import('./public/Pricing'));
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function PublicLayout() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'fr' : 'ar';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 sticky top-0 z-10 shrink-0">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-2" aria-label={t('app_title')}>
            <img src="/logo.webp" alt="Sehatak Online Logo" width="224" height="72" className="h-18 w-56 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/pricing" className="text-sm font-bold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm transition-all duration-300 whitespace-nowrap">
              {t('subscription_plans')}
            </Link>
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl">
              <Globe className="w-4 h-4" />
              {i18n.language === 'ar' ? t('language_fr') : t('language_ar')}
            </button>
            <Link to="/login" className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap">
              {t('doctor_login')}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Suspense fallback={<div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="doctors/:id" element={<DoctorProfile />} />
          <Route path="p/:id" element={<DoctorProfile />} />
          <Route path="pricing" element={<Pricing />} />
        </Routes>
        </Suspense>
      </main>
      
      <footer className="h-10 bg-slate-100 border-t border-slate-200 px-4 md:px-8 flex items-center justify-center text-[11px] text-slate-700 shrink-0">
        <p>© {new Date().getFullYear()} {t('footer_rights')}</p>
      </footer>
    </div>
  );
}
