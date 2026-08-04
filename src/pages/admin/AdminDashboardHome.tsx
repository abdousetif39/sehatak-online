import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth, secondaryAuth } from '../../lib/firebase';
import { COLLECTIONS, ROLES, WEEKDAYS } from '../../lib/constants';
import { Users, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminDashboardHome() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    doctors: 0,
    appointments: 0,
    todayAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const doctorsSnap = await getDocs(collection(db, COLLECTIONS.DOCTORS));
        const appointmentsSnap = await getDocs(collection(db, COLLECTIONS.APPOINTMENTS));
        
        const today = new Date().toISOString().split('T')[0];
        const todayAppointmentsSnap = await getDocs(
          query(collection(db, COLLECTIONS.APPOINTMENTS), where('date', '==', today))
        );

        setStats({
          doctors: doctorsSnap.size,
          appointments: appointmentsSnap.size,
          todayAppointments: todayAppointmentsSnap.size
        });
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">{t('loading')}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">{t('overview')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title={t('registered_doctors')} 
          value={stats.doctors} 
          icon={Users} 
          color="bg-blue-50 text-blue-600"
          link="/admin/doctors"
          badgeText={t('total')}
        />
        <StatCard 
          title={t('booked_appointments')} 
          value={stats.appointments} 
          icon={Calendar} 
          color="bg-indigo-50 text-indigo-600"
          link="/admin/appointments"
          badgeText={t('future')}
        />
        <StatCard 
          title={t('today_appointments')} 
          value={stats.todayAppointments} 
          icon={Clock} 
          color="bg-emerald-50 text-emerald-600"
          link="/admin/appointments"
          badgeText={t('today')}
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, link, badgeText }: any) {
  return (
    <Link to={link} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 hover:border-blue-300 hover:shadow-sm transition-all group">
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{badgeText}</span>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        <p className="text-[13px] text-slate-500 mt-1 font-medium">{title}</p>
      </div>
    </Link>
  );
}
