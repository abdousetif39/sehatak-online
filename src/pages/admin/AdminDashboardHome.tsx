import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth, secondaryAuth } from '../../lib/firebase';
import { COLLECTIONS, ROLES, WEEKDAYS } from '../../lib/constants';
import { Users, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { updateDoc, doc } from 'firebase/firestore';
import { generateDoctorSlug } from '../../utils/doctorUtils';
import { Doctor } from '../../types';
import MessageModal from '../../components/MessageModal';

export default function AdminDashboardHome() {
  const [fixingSlugs, setFixingSlugs] = useState(false);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });

  const handleFixSlugs = async () => {
    setFixingSlugs(true);
    try {
      const doctorsSnap = await getDocs(collection(db, COLLECTIONS.DOCTORS));
      const doctors = doctorsSnap.docs.map(doc => doc.data() as Doctor);
      
      const slugCounts = new Map<string, number>();
      doctors.forEach(doc => {
        if (doc.slug) {
          slugCounts.set(doc.slug, (slugCounts.get(doc.slug) || 0) + 1);
        }
      });

      let updatedCount = 0;
      for (const docData of doctors) {
        let needsUpdate = false;
        let newSlug = docData.slug;
        
        if (!docData.slug || (slugCounts.get(docData.slug) || 0) > 1 || !docData.slug.includes(docData.id.slice(-6).toLowerCase())) {
          newSlug = generateDoctorSlug(
            docData.firstNameFr || '', 
            docData.lastNameFr || '', 
            docData.specialtyFr || '', 
            docData.city || '', 
            docData.id
          );
          if (docData.slug !== newSlug) {
            needsUpdate = true;
          }
        }
        
        if (needsUpdate && newSlug) {
          await updateDoc(doc(db, "doctors", docData.id), { slug: newSlug });
          updatedCount++;
        }
      }
      setMessageModal({ isOpen: true, type: "success", title: t("success"), message: t("slugs_updated_success", { count: updatedCount }) });
    } catch (e: any) {
      setMessageModal({ isOpen: true, type: "error", title: t("error"), message: e.message });
    } finally {
      setFixingSlugs(false);
    }
  };

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('overview')}</h1>
        <button 
          onClick={handleFixSlugs} 
          disabled={fixingSlugs}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-bold"
        >
          {fixingSlugs ? t("updating") : t("fix_slugs")}
        </button>
      </div>
      
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

      <MessageModal 
        isOpen={messageModal.isOpen} 
        onClose={() => setMessageModal(prev => ({ ...prev, isOpen: false }))} 
        type={messageModal.type} 
        title={messageModal.title} 
        message={messageModal.message} 
      />
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
