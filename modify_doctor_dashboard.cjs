const fs = require('fs');
let code = fs.readFileSync('src/pages/doctor/DoctorDashboardHome.tsx', 'utf8');

// The issue with the date is that we need to use the actual date that the DoctorDashboardHome is displaying, which is "selectedDate" state. Let's make sure it's formatting it as yyyy-MM-dd.

// Imports: Add Print and Download icons, maybe jsPDF if we have it, or we can use window.print() and a simple CSV generation for download. Since we don't want to install extra libraries if not needed, we'll use window.print() for print and CSV/Blob for download.
code = code.replace(
  "import { Search, Loader2, Edit, X, Phone, User as UserIcon, Calendar, Filter, History, Trash2, Settings, MessageSquare, Printer, Download } from 'lucide-react';",
  "import { Search, Loader2, Edit, X, Phone, User as UserIcon, Calendar, Filter, History, Trash2, Settings, MessageSquare, Printer, Download } from 'lucide-react';"
);
if (!code.includes('Printer, Download')) {
  code = code.replace(
    "import { Search, Loader2, Edit, X, Phone, User as UserIcon, Calendar, Filter, History, Trash2, Settings, MessageSquare } from 'lucide-react';",
    "import { Search, Loader2, Edit, X, Phone, User as UserIcon, Calendar, Filter, History, Trash2, Settings, MessageSquare, Printer, Download } from 'lucide-react';"
  );
}

// Add state for printing
if (!code.includes('isPrinting')) {
  code = code.replace(
    "const [messageModal, setMessageModal] = useState",
    "const [isPrinting, setIsPrinting] = useState(false);\n  const [messageModal, setMessageModal] = useState"
  );
}

// Add print styles to head
if (!code.includes('handlePrint')) {
  const printFunctions = `
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleDownload = () => {
    try {
      const dateStr = selectedDate;
      const csvHeader = [t('appointment_time'), t('patient_name'), t('phone'), t('appointment_status')].join(',');
      const csvRows = filteredAppointments.map(app => {
        return [\`"\${app.time}"\`, \`"\${app.patientName} \${app.patientLastName}"\`, \`"\${app.patientPhone}"\`, \`"\${t('status_' + app.status)}"\`].join(',');
      });
      const csvContent = "data:text/csv;charset=utf-8,\\uFEFF" + csvHeader + "\\n" + csvRows.join("\\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", \`\${t('today_appointments')} - \${dateStr}.csv\`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessageModal({
        open: true,
        type: 'success',
        title: t('success'),
        message: t('download_success')
      });
    } catch (err) {
      setMessageModal({
        open: true,
        type: 'error',
        title: t('error'),
        message: t('download_error')
      });
    }
  };
`;

  code = code.replace(
    "const filteredAppointments = appointments.filter",
    printFunctions + "\n  const filteredAppointments = appointments.filter"
  );
}

// Update buttons in header
const headerRegex = /<div className="flex items-center gap-2">\s*<Link to=\{`\/doctors\/\$\{doctorSlug \|\| \(user\?.role === 'receptionist' \? user.doctorId : user\?.id\)\}`\} target="_blank" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold transition-colors text-sm shadow-sm">\s*\{t\('create_new_appointment'\)\}\s*<\/Link>\s*<\/div>/;

if (code.match(headerRegex)) {
    code = code.replace(headerRegex, `<div className="flex flex-wrap items-center gap-2">
          <Link to={\`/doctors/\${doctorSlug || (user?.role === 'receptionist' ? user.doctorId : user?.id)}\`} target="_blank" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold transition-colors text-sm shadow-sm hide-on-print">
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
        </div>`);
}

// Hide elements on print and create print layout
const returnStatement = /return \(\s*<div>/s;
if (code.match(returnStatement)) {
    code = code.replace(returnStatement, `return (
    <>
      <style>
        {\`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .hide-on-print {
              display: none !important;
            }
          }
        \`}
      </style>
    <div className="print-area">
      {isPrinting && (
        <div className="mb-8 border-b pb-4 hidden print:block">
          <h2 className="text-2xl font-bold mb-2">صحتك أونلاين</h2>
          <p className="text-lg mb-1">{t('appointments_for_today')}</p>
          <p className="text-md text-slate-600">{t('date')}: {selectedDate}</p>
        </div>
      )}`);
}

// Make sure to close the extra fragment tag
code = code.replace("export default function DoctorDashboardHome", "export default function DoctorDashboardHome");
const lastDiv = /<\/div>\s*\);\s*\}\s*$/;
if (code.match(lastDiv)) {
    code = code.replace(lastDiv, "</div>\n    </>\n  );\n}");
}

fs.writeFileSync('src/pages/doctor/DoctorDashboardHome.tsx', code);
