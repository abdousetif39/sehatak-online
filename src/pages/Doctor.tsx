import { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Menu, Calendar as CalendarIcon, Settings as SettingsIcon } from 'lucide-react';
import DoctorDashboardHome from './doctor/DoctorDashboardHome';
import DoctorSettings from './doctor/DoctorSettings';
import StaffManager from './doctor/StaffManager';
import PatientsSearch from './doctor/PatientsSearch';
import DoctorCalendar from './doctor/Calendar';
import { Users, Search, Globe, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DoctorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);




  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'fr' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const { user } = useAuth();

  const navItems = [
    { name: t('menu_today_appointments'), path: '/doctor', icon: CalendarIcon },
    { name: t('calendar'), path: '/doctor/calendar', icon: CalendarDays },
    { name: t('patients_search_title'), path: '/doctor/patients', icon: Search },
  ];
  if (user?.role === 'doctor') {
    navItems.push({ name: t('menu_staff_manager'), path: '/doctor/staff', icon: Users });
    navItems.push({ name: t('menu_clinic_settings'), path: '/doctor/settings', icon: SettingsIcon });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navigation Bar */}
      <nav className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
        <div className="flex items-center gap-8">
          
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center">
            <img
            src="/logo.png"
            alt="Sehatak Online Logo"
            className="h-18 w-56 object-contain cursor-pointer"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
</Link>
           
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLanguage} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full hidden md:flex">
            <Globe className="w-4 h-4" />
            {i18n.language === 'ar' ? t('language_fr') : t('language_ar')}
          </button>
          <div className="text-left ltr:ml-4 rtl:mr-4 hidden md:block">
            <p className="text-sm font-bold leading-none">{t('doctor_dashboard')}</p>
            <p className="text-xs text-slate-500 mt-1">{t('doctor_dashboard_sub')}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden hidden md:block">
            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">DR</div>
          </div>
          <button onClick={handleLogout} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <aside className={`fixed md:static inset-y-0 ltr:left-0 rtl:right-0 z-50 w-64 bg-white ltr:border-r rtl:border-l border-slate-200 p-6 flex flex-col gap-2 shrink-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'max-md:ltr:-translate-x-full max-md:rtl:translate-x-full'}`}>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('main_menu')}</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                onClick={() => setIsSidebarOpen(false)}
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
          
          <div className="mt-auto pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-start rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              {t('logout')}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 overflow-y-auto">
          <Routes>
            <Route index element={<DoctorDashboardHome />} />
            <Route path="patients" element={<PatientsSearch />} />
            <Route path="calendar" element={<DoctorCalendar />} />
            {user?.role === 'doctor' && (
              <>
                <Route path="settings" element={<DoctorSettings />} />
                <Route path="staff" element={<StaffManager />} />
              </>
            )}
            {user?.role === 'receptionist' && (
              <>
                <Route path="settings" element={<div className="p-8 text-center text-rose-500 font-bold">{t('access_denied')}</div>} />
                <Route path="staff" element={<div className="p-8 text-center text-rose-500 font-bold">{t('access_denied')}</div>} />
              </>
            )}
          </Routes>
        </main>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-10 bg-slate-100 border-t border-slate-200 px-4 md:px-8 flex items-center justify-between text-[11px] text-slate-500 shrink-0 hidden md:flex">
        <div className="flex gap-4">
          <span>{t('user_doctor')}</span>
          <span>{t('system_connection')} <span className="text-green-600">{t('active')}</span></span>
        </div>
        <div>© {new Date().getFullYear()} {t('footer_rights')}</div>
      </footer>
    </div>
  );
}
