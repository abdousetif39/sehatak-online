import { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Menu, Users, Calendar, LayoutDashboard, UserCheck, Globe } from 'lucide-react';
import DoctorsManager from './admin/DoctorsManager';
import ReceptionistsManager from './admin/ReceptionistsManager';
import AppointmentsViewer from './admin/AppointmentsViewer';
import AdminDashboardHome from './admin/AdminDashboardHome';
import AdminSupportChat from './admin/AdminSupportChat';
import { useTranslation } from 'react-i18next';
import { collection, query, where, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../lib/constants';
import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasUnreadSupport, setHasUnreadSupport] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const q = query(
      collection(db, COLLECTIONS.SUPPORT_CONVERSATIONS),
      where('unreadForAdmin', '==', true)
    );
    const unsub = onSnapshot(q, async (snap) => {
      setHasUnreadSupport(!snap.empty);
      if (!snap.empty) {
        try {
          const now = new Date().toISOString();
          for (const convDoc of snap.docs) {
            const msgsQuery = query(
              collection(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${convDoc.id}/messages`),
              where('senderRole', '==', 'doctor')
            );
            const msgsSnap = await getDocs(msgsQuery);
            const batch = writeBatch(db);
            let hasUpdates = false;

            for (const mDoc of msgsSnap.docs) {
              const data = mDoc.data();
              if (!data.deliveredAt && !data.readAt) {
                batch.update(mDoc.ref, { deliveredAt: now });
                hasUpdates = true;
              }
            }
            if (hasUpdates) await batch.commit();
          }
        } catch (e) {
          console.error("Error setting delivered status for admin:", e);
        }
      }
    }, (error) => { console.error("Firestore onSnapshot error:", error.message || error); });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'fr' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const navItems: { name: string; path: string; icon: any; hasBadge?: boolean }[] = [
    { name: t('menu_home'), path: '/admin', icon: LayoutDashboard },
    { name: t('menu_doctors'), path: '/admin/doctors', icon: Users },
    { name: t('menu_receptionists'), path: '/admin/receptionists', icon: UserCheck },
    { name: t('menu_appointments'), path: '/admin/appointments', icon: Calendar },
    { name: t('admin_support'), path: '/admin/support', icon: MessageCircle, hasBadge: hasUnreadSupport },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <nav className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
        <div className="flex items-center gap-8">
          
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center">
            <img
            src="/logo.webp"
            width="224"
            height="72"
            alt="Sehatek Online Logo"
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
            <p className="text-sm font-bold leading-none">{t('admin_dashboard')}</p>
            <p className="text-xs text-slate-500 mt-1">{t('admin_dashboard_sub')}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden hidden md:block">
            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">A</div>
          </div>
          <button onClick={handleLogout} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
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
            const isActive = location.pathname === item.path || (item.path !== '/admin' && (location.pathname || '').startsWith(item.path));
            
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
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {(item as any).hasBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
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

        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 overflow-y-auto">
          <Routes>
            <Route index element={<AdminDashboardHome />} />
            <Route path="doctors" element={<DoctorsManager />} />
            <Route path="receptionists" element={<ReceptionistsManager />} />
            <Route path="appointments" element={<AppointmentsViewer />} />
            <Route path="support" element={<AdminSupportChat />} />
          </Routes>
        </main>
      </div>
      
      <footer className="h-10 bg-slate-100 border-t border-slate-200 px-4 md:px-8 flex items-center justify-between text-[11px] text-slate-500 shrink-0 hidden md:flex">
        <div className="flex gap-4">
          <span>{t('user_admin')}</span>
          <span>{t('system_connection')} <span className="text-green-600">{t('active')}</span></span>
        </div>
        <div>© {new Date().getFullYear()} {t('footer_rights')}</div>
      </footer>
    </div>
  );
}
