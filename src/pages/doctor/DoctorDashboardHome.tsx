import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, writeBatch } from 'firebase/firestore';
import { db, auth, secondaryAuth } from '../../lib/firebase';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import MessageModal from '../../components/MessageModal';
import { COLLECTIONS, ROLES, WEEKDAYS } from '../../lib/constants';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorFullName, getDoctorDisplayName } from '../../utils/doctorUtils';
import { Doctor } from '../../types';
import { Appointment } from '../../types';
import { Search, CheckCircle, Download, Printer, Clock, Trash2, Calendar, FileText, Phone, User as UserIcon, XCircle, MessageCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function DoctorDashboardHome() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctorSlug, setDoctorSlug] = useState<string | null>(null);
  const [doctorData, setDoctorData] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
const [showPrintPreview, setShowPrintPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [messageModal, setMessageModal] = useState({
  open: false,
  type: "info" as "success" | "error" | "warning" | "info",
  title: "",
  message: "",
});
  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    const targetDoctorId = user.role === 'receptionist' ? user.doctorId : user.id;
    try {
      const dRef = await import('firebase/firestore').then(m => m.getDoc(m.doc(db, COLLECTIONS.DOCTORS, targetDoctorId as string)));
      if (dRef.exists()) {
        if (dRef.data().slug) setDoctorSlug(dRef.data().slug);
        setDoctorData(dRef.data() as Doctor);
      }
    } catch (e) {
      console.error(e);
    }
    try {
      const q = query(
        collection(db, COLLECTIONS.APPOINTMENTS),
        where('doctorId', '==', targetDoctorId),
        where('date', '==', selectedDate),
        orderBy('time', 'asc')
      );
      const snap = await getDocs(q);
      setAppointments(snap.docs.map(d => ({ ...d.data(), id: d.id } as Appointment)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, selectedDate]);

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    try {
              console.log("Delete ID:", id);
        console.log("Firestore path:", COLLECTIONS.APPOINTMENTS, id);
const batch = writeBatch(db);
      batch.update(doc(db, COLLECTIONS.APPOINTMENTS, id), { status });
      if (status === 'cancelled') {
        batch.delete(doc(db, COLLECTIONS.PUBLIC_SLOTS, id));
      }
      await batch.commit();
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      setMessageModal({
  open: true,
  type: "success",
  title: t("success"),
  message: t("status_updated"),
});
    } catch (e: any) {
      console.error("Update Error:", { id, collection: COLLECTIONS.APPOINTMENTS, errorCode: e.code, message: e.message });
      setMessageModal({
  open: true,
  type: "error",
  title: t("error"),
  message: `${t('update_failed')}: ${e.message}`,
});
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete;
    setIsDeleting(true);
    try {
      console.log("Delete ID:", id);
      console.log("Firestore path:", COLLECTIONS.APPOINTMENTS, id);
      const batch = writeBatch(db);
      batch.delete(doc(db, COLLECTIONS.APPOINTMENTS, id));
      batch.delete(doc(db, COLLECTIONS.PUBLIC_SLOTS, id));
      await batch.commit();
      await fetchAppointments();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (e: any) {
      console.error("Delete Error:", { id, collection: 'appointments/public_slots', errorCode: e.code, message: e.message });
      setMessageModal({
      open: true,
      type: "error",
      title: t("error"),
      message: `${t('delete_failed')}: ${e.message}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  
  const handlePrint = () => {
    setShowPrintPreview(true);
  };
  const executePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;
    
    printWindow.document.open();
    printWindow.document.write(getPrintHtml());
    printWindow.document.close();
    
    // Wait for images to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setShowPrintPreview(false);
      }, 500);
    };
  };

  
    const getPrintHtml = () => {
    const isArabic = i18n.language.startsWith('ar');
    const dir = isArabic ? 'rtl' : 'ltr';
    const doctorFullName = doctorData ? getDoctorFullName(doctorData, i18n.language) : (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : t('doctor'));
    
    const doctorNameForPdf = isArabic
      ? `\u200Fد.\u00A0${doctorFullName}`
      : `Dr. ${doctorFullName}`;
      
    const pdfDateForArabic = isArabic
      ? `<span class="pdf-date-label"><span class="date-word">${t('date')}</span><span class="date-colon">:</span></span><span class="pdf-date-value">${selectedDate}</span>`
      : `<span class="pdf-date-label">${t('date')} :</span><span class="pdf-date-value">${selectedDate}</span>`;

    const escapeHtml = (value: string = '') =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const formatPdfName = (value: string = '', isArabicLang = false) => {
      const text = value.trim();
      if (!isArabicLang) {
        return escapeHtml(text);
      }
      return escapeHtml(text).replace(/ /g, '&nbsp;');
    };

    let rows = filteredAppointments.filter(app => app.date === selectedDate).map(app => `
      <tr>
        <td style="border-bottom: 1px solid #e2e8f0; padding: 12px 16px; text-align: center; direction: ltr;">
          <span dir="ltr" style="direction: ltr; unicode-bidi: isolate; white-space: nowrap;">${app.time}</span>
        </td>
        <td dir="${isArabic ? 'rtl' : 'ltr'}" style="border-bottom: 1px solid #e2e8f0; padding: 12px 16px; text-align: ${isArabic ? 'right' : 'left'}; direction: ${isArabic ? 'rtl' : 'ltr'}; unicode-bidi: isolate; white-space: normal;">
          <span dir="${isArabic ? 'rtl' : 'ltr'}" style="direction: ${isArabic ? 'rtl' : 'ltr'}; unicode-bidi: isolate; white-space: normal;">
            ${formatPdfName(`${app.patientName || ''} ${app.patientLastName || ''}`.trim(), isArabic)}
          </span>
        </td>
        <td style="border-bottom: 1px solid #e2e8f0; padding: 12px 16px; text-align: center; direction: ltr;">
          <span dir="ltr" style="direction: ltr; unicode-bidi: isolate; white-space: nowrap;">${app.patientPhone}</span>
        </td>
        <td style="border-bottom: 1px solid #e2e8f0; padding: 12px 16px; text-align: center;">${app.patientFileNumber || '-'}</td>
        <td style="border-bottom: 1px solid #e2e8f0; padding: 12px 16px; text-align: center;">${t('status_' + app.status)}</td>
      </tr>
    `).join('');

    if (rows === '') {
      rows = `<tr><td colspan="5" style="border-bottom: 1px solid #e2e8f0; padding: 24px; text-align: center; color: #64748b;">${t('no_appointments')}</td></tr>`;
    }

    return `
      <html dir="${dir}">
        <head>
          <title>${t('appointments_for_today')} - ${selectedDate}</title>
          <style>
            body { font-family: sans-serif; color: #0f172a; background: #fff; padding: 40px; margin: 0; }
            .header-container { text-align: center; margin-bottom: 20px; }
            .logo { max-width: 150px; height: auto; margin-bottom: 8px; }
            
            .doctor-date-row { 
              width: 100%;
              display: flex; 
              flex-direction: row;
              justify-content: center; 
              align-items: center; 
              gap: 12px; 
              direction: ltr;
              margin-bottom: 6px;
              font-size: 18px; 
              color: #1e293b; 
              font-weight: bold;
            }
            .doctor-name-pdf { 
              white-space: nowrap;
              text-align: center;
            }
            .pdf-date-container {
              display: flex;
              flex-direction: row;
              align-items: center;
              gap: 6px;
              direction: ltr;
              unicode-bidi: isolate;
              white-space: nowrap;
            }
            .pdf-date-label {
              display: inline-flex;
              direction: ltr;
              unicode-bidi: isolate;
              white-space: nowrap;
            }
            .date-word {
              direction: rtl;
              unicode-bidi: isolate;
            }
            .date-colon {
              direction: ltr;
              unicode-bidi: isolate;
            }
            .pdf-date-value {
              direction: ltr;
              unicode-bidi: isolate;
              white-space: nowrap;
            }
            .separator { color: #cbd5e1; font-weight: normal; direction: ltr; unicode-bidi: isolate; }
            
            .report-title { font-size: 16px; margin: 0 0 16px 0; font-weight: bold; color: #334155; }
            table { width: 100%; max-width: 900px; margin: 0 auto; border-collapse: collapse; background: #fff; }
            th { border-bottom: 2px solid #cbd5e1; padding: 16px; text-align: center; font-weight: bold; background: #f8fafc; color: #334155; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <img src="/logo.webp" alt="Logo" class="logo" onerror="this.style.display='none'" />
            <div class="doctor-date-row">
              <div class="pdf-date-container">${pdfDateForArabic}</div>
              <span class="separator" dir="ltr">|</span>
              <div class="doctor-name-pdf">${doctorNameForPdf}</div>
            </div>
            <h2 class="report-title">${t('appointments_for_today')}</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>${t('appointment_time')}</th>
                <th>${t('patient_name')}</th>
                <th>${t('phone')}</th>
                <th>${t('file_number')}</th>
                <th>${t('status')}</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;  };

  const handleDownload = () => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow?.document;
      if (!doc) throw new Error('No iframe document');
      
      const messageHandler = (e: MessageEvent) => {
        if (e.data === 'pdf-success') {
          window.removeEventListener('message', messageHandler);
          document.body.removeChild(iframe);
          setMessageModal({
            open: true,
            type: 'success',
            title: t('success'),
            message: t('pdf_generated_successfully') || t('download_success')
          });
        }
      };
      window.addEventListener('message', messageHandler);

      doc.open();
      const pdfTitle = i18n.language.startsWith('fr') ? 'Rendez-vous-du-jour' : 'مواعيد-اليوم';
      const fileName = `${pdfTitle}-${selectedDate}.pdf`;
      
      const htmlContent = getPrintHtml().replace('</body>', `
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
        <script>
          window.onload = function() {
            var opt = {
              margin: 10,
              filename: '${fileName}',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true, logging: false },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(document.body).save().then(function() {
              window.parent.postMessage('pdf-success', '*');
            });
          };
        <\/script>
      </body>`);
      doc.write(htmlContent);
      doc.close();

    } catch (err) {
      setMessageModal({
        open: true,
        type: 'error',
        title: t('error'),
        message: t('pdf_generation_error') || t('download_error')
      });
    }
  };

  const filteredAppointments = appointments.filter(app => 
    `${app.patientName} ${app.patientLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.patientFileNumber && app.patientFileNumber.includes(searchTerm)) ||
    app.patientPhone.includes(searchTerm)
  );

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-section, #print-section * {
              visibility: visible;
            }
            #print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              background: white;
            }
            .hide-on-print {
              display: none !important;
            }
          }
        `}
      </style>
      
      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">{t('print_preview') || 'Print Preview'}</h2>
              <button onClick={() => setShowPrintPreview(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
               <div className="bg-white p-12 shadow-sm border border-slate-200 min-h-[297mm] max-w-[210mm] mx-auto" dir={i18n.language.startsWith('ar') ? 'rtl' : 'ltr'}>
                  
                  <div className="text-center mb-6">
                    <img src="/logo.webp" alt="Logo" className="max-w-[150px] h-auto mx-auto mb-2" />
                    <div className="flex justify-center items-center gap-3 mb-1.5 text-lg font-bold text-slate-900">
                      <span>{doctorData ? getDoctorDisplayName(doctorData, i18n.language) : (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : t('doctor'))}</span>
                      <span className="text-slate-300 font-normal">|</span>
                      <span dir={i18n.language.startsWith('ar') ? 'rtl' : 'ltr'}><span>{t('date')}:</span> <span dir="ltr">{selectedDate}</span></span>
                    </div>
                    <h2 className="text-base font-bold text-slate-700">{t('appointments_for_today')}</h2>
                  </div>

                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border-b-2 border-slate-200 py-4 px-4 text-center font-bold text-slate-700 bg-slate-50">{t('appointment_time')}</th>
                        <th className="border-b-2 border-slate-200 py-4 px-4 text-center font-bold text-slate-700 bg-slate-50">{t('patient_name')}</th>
                        <th className="border-b-2 border-slate-200 py-4 px-4 text-center font-bold text-slate-700 bg-slate-50">{t('phone')}</th>
                        <th className="border-b-2 border-slate-200 py-4 px-4 text-center font-bold text-slate-700 bg-slate-50">{t('patient_file_number')}</th>
                        <th className="border-b-2 border-slate-200 py-4 px-4 text-center font-bold text-slate-700 bg-slate-50">{t('appointment_status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.filter(app => app.date === selectedDate).map(app => (
                        <tr key={app.id}>
                          <td className="border-b border-slate-100 py-3 px-4 text-center" dir="ltr">{app.time}</td>
                          <td className="border-b border-slate-100 py-3 px-4" dir={i18n.language.startsWith('ar') ? 'rtl' : 'ltr'} style={{ textAlign: i18n.language.startsWith('ar') ? 'right' : 'left', unicodeBidi: 'plaintext', whiteSpace: 'normal' }}>{(app.patientName + ' ' + (app.patientLastName || '')).trim()}</td>
                          <td className="border-b border-slate-100 py-3 px-4 text-center" dir="ltr">{app.patientPhone}</td>
                          <td className="border-b border-slate-100 py-3 px-4 text-center">{app.patientFileNumber || '-'}</td>
                          <td className="border-b border-slate-100 py-3 px-4 text-center">{t('status_' + app.status)}</td>
                        </tr>
                      ))}
                      {filteredAppointments.filter(app => app.date === selectedDate).length === 0 && (
                        <tr>
                          <td colSpan={5} className="border-b border-slate-100 py-8 text-center text-slate-500">
                            {t('no_appointments')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-white">
              <button onClick={() => setShowPrintPreview(false)} className="px-5 py-2 text-slate-700 hover:bg-slate-100 font-medium rounded-xl transition-colors">
                {t('cancel') || 'Cancel'}
              </button>
              <button onClick={executePrint} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2">
                <Printer className="w-4 h-4" />
                {t('print') || 'Print'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{t('today_appointments')}</h1>
          <p className="text-slate-500 text-sm">{t('manage_appointments_desc')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/doctors/${doctorSlug || (user?.role === 'receptionist' ? user.doctorId : user?.id)}`} target="_blank" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold transition-colors text-sm shadow-sm hide-on-print">
            {t('create_new_appointment')}
          </Link>
          <button onClick={handleDownload} className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm border border-emerald-200 hide-on-print">
            <Download className="w-4 h-4" />
            <span>{t('download_today_appointments')}</span>
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm border border-slate-200 hide-on-print">
            <Printer className="w-4 h-4" />
            <span>{t('print_today_appointments')}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input name="searchterm" id="searchterm" 
              type="text" 
              placeholder={t('search_patient')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 w-full md:w-64 transition-colors"
             autoComplete="off" />
          </div>
          <input name="selecteddate" id="selecteddate" 
            type="date" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
            dir="ltr"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 text-slate-500">{t('loading')}</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shrink-0">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <div className="w-24 text-center">{t('time')}</div>
            <div className="flex-1">{t('patient')}</div>
            <div className="w-32 text-center">{t('status')}</div>
            <div className="w-24 text-center">{t('actions')}</div>
          </div>
          
          <div className="flex-col divide-y divide-slate-100">
            {filteredAppointments.map(app => (
              <div key={app.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group">
                <div className="w-24 text-sm font-bold text-slate-900 text-center" dir="ltr">
                  {app.time}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    {(app.patientName + ' ' + (app.patientLastName || '')).trim()}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3" /> <span dir="ltr">{app.patientPhone}</span>
                    {app.patientFileNumber && (
                      <>
                        <span className="mx-1">•</span>
                        <FileText className="w-3 h-3" /> {t('file_number_prefix')}{app.patientFileNumber}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="w-32 flex justify-center">
                  <StatusBadge status={app.status} t={t} />
                </div>
                
                <div className="w-24 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {app.status === 'booked' && (
                    <>
                      <button onClick={() => handleStatusChange(app.id, 'examined')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title={t('mark_examined')}>
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleStatusChange(app.id, 'no_show')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title={t('mark_no_show')}>
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleStatusChange(app.id, 'cancelled')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors" title={t('cancel_appointment')}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
                      </button>
                    </>
                  )}
                  <button onClick={() => confirmDelete(app.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title={t('delete_appointment')}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredAppointments.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center text-slate-500 text-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                {t('no_appointments_today')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Admin Chat Card */}
      <div className="mt-8 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <MessageCircle className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1 text-center sm:ltr:text-left sm:rtl:text-right">
          <h3 className="font-bold text-slate-900 mb-1">{t('need_help')}</h3>
          <p className="text-slate-700 text-sm leading-relaxed mb-4">
            {t('contact_admin_desc')}
          </p>
          <Link 
            to="/doctor/support"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            {t('contact_admin_btn')}
          </Link>
        </div>
      </div>

      {/* Support / Feedback Card (Email) */}
      <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <MessageCircle className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 text-center sm:ltr:text-left sm:rtl:text-right">
          <p className="text-slate-700 text-sm leading-relaxed mb-2">
            {t('doctor_support_message')}
          </p>
          <a 
            href={`mailto:${t('doctor_support_email')}`} 
            className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            {t('doctor_support_email')}
          </a>
        </div>
      </div>

      <MessageModal
      isOpen={messageModal.open}
      type={messageModal.type}
      title={messageModal.title}
      message={messageModal.message}
      onClose={() =>
      setMessageModal({
      open: false,
      type: "info",
      title: "",
      message: "",
    })
  }
/>
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('confirm_delete_appointment_title')}
        message={t('confirm_delete_appointment_desc')}
      />
    </div>
    </>
  );
}

function StatusBadge({ status, t }: { status: string, t: any }) {
  if (status === 'examined') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle className="w-3.5 h-3.5" /> {t('mark_examined')}</span>;
  }
  if (status === 'booked') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Clock className="w-3.5 h-3.5" /> {t('status_booked')}</span>;
  }
  if (status === 'no_show') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{t('mark_no_show')}</span>;
  }
  if (status === 'cancelled') {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
      {t('status_cancelled')}
    </span>
  );
}
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{t('status_unknown')}</span>;
}