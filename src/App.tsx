import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './pages/Public';
const AuthLayout = React.lazy(() => import('./pages/Auth'));
const RegisterDoctor = React.lazy(() => import('./pages/RegisterDoctor'));
const AdminLayout = React.lazy(() => import('./pages/Admin'));
const DoctorLayout = React.lazy(() => import('./pages/Doctor'));
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: ('admin' | 'doctor' | 'receptionist')[] }) => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  
  if (loading) return <div className="p-8 text-center">{t('loading')}</div>;
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const isAr = (i18n.language || '').startsWith('ar');
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = isAr ? 'ar' : 'fr';
    document.title = t('app_title');
  }, [i18n.language]);

  return (
    <div dir={(i18n.language || '').startsWith('ar') ? 'rtl' : 'ltr'} className="font-sans min-h-screen">
      <AuthProvider>
        <Router>
          <React.Suspense fallback={<div className="p-8 text-center">{t('loading')}</div>}>
          <Routes>
            <Route path="/*" element={<PublicLayout />} />
            <Route path="/login" element={<AuthLayout />} />
            <Route path="/register" element={<RegisterDoctor />} />
            
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            } />
            
            <Route path="/doctor/*" element={
              <ProtectedRoute allowedRoles={['doctor', 'receptionist']}>
                <DoctorLayout />
              </ProtectedRoute>
            } />
          </Routes>
          </React.Suspense>
        </Router>
      </AuthProvider>
    </div>
  );
}
