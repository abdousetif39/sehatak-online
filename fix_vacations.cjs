const fs = require('fs');

// 1. Update Translations
const arFile = 'src/locales/ar.json';
let arContent = JSON.parse(fs.readFileSync(arFile, 'utf8'));

arContent.appointments_exist_in_vacation_title = "توجد مواعيد محجوزة داخل فترة الإجازة";
arContent.appointments_exist_in_vacation_desc = "يوجد موعد أو أكثر محجوز داخل فترة الإجازة التي اخترتها. يجب تغيير مواعيد المرضى الموجودة داخل أيام الإجازة قبل تأكيد الإجازة.";
arContent.affected_appointments = "عدد المواعيد المتأثرة:";
arContent.vacation_name_required_title = "اسم الإجازة مطلوب";
arContent.vacation_name_required_desc = "يرجى إدخال اسم الإجازة أو سببها قبل حفظ الإجازة.";

fs.writeFileSync(arFile, JSON.stringify(arContent, null, 2));

const frFile = 'src/locales/fr.json';
let frContent = JSON.parse(fs.readFileSync(frFile, 'utf8'));

frContent.appointments_exist_in_vacation_title = "Des rendez-vous existent pendant cette période de congé";
frContent.appointments_exist_in_vacation_desc = "Un ou plusieurs rendez-vous sont déjà réservés pendant la période de congé sélectionnée. Vous devez modifier les rendez-vous concernés avant de confirmer le congé.";
frContent.affected_appointments = "Nombre de rendez-vous concernés :";
frContent.vacation_name_required_title = "Le nom du congé est obligatoire";
frContent.vacation_name_required_desc = "Veuillez saisir le nom ou le motif du congé avant d'enregistrer le congé.";

fs.writeFileSync(frFile, JSON.stringify(frContent, null, 2));

// 2. Rewrite VacationSettings.tsx to include warnings
const vacationFile = 'src/components/doctor/VacationSettings.tsx';
let vacationContent = fs.readFileSync(vacationFile, 'utf8');

const importsToReplace = `import { Doctor, DoctorVacation } from "../../types";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

interface Props {`;

const newImports = `import { Doctor, DoctorVacation, Appointment } from "../../types";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../lib/constants";

interface Props {`;

vacationContent = vacationContent.replace(importsToReplace, newImports);

const modalStateToReplace = `  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(
    null
  );
  const [vacation, setVacation] =
    useState<DoctorVacation>(emptyVacation);`;

const newModalState = `  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vacation, setVacation] = useState<DoctorVacation>(emptyVacation);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningType, setWarningType] = useState<"name" | "appointments" | null>(null);
  const [affectedAppointments, setAffectedAppointments] = useState(0);
  const [isChecking, setIsChecking] = useState(false);`;

vacationContent = vacationContent.replace(modalStateToReplace, newModalState);

const handleSaveToReplace = `  const handleSave = () => {
    if (
      !vacation.titleAr ||
      !vacation.titleFr ||
      !vacation.startDate ||
      !vacation.endDate
    ) {
      return;
    }

    let list = [...vacations];
    if (editingId) {
      list = list.map((v) =>
        v.id === editingId ? vacation : v
      );
    } else {
      list.push({
        ...vacation,
        id: crypto.randomUUID(),
      });
    }

    setFormData((prev) => ({
      ...prev,
      vacations: list,
    }));
    resetForm();
    setShowModal(false);
  };`;

const newHandleSave = `  const handleSave = async () => {
    if (!vacation.titleAr || !vacation.titleFr) {
      setWarningType("name");
      setWarningModalOpen(true);
      return;
    }

    if (!vacation.startDate || !vacation.endDate) {
      return;
    }

    // Check for existing appointments
    if (formData.id) {
      setIsChecking(true);
      try {
        const q = query(
          collection(db, COLLECTIONS.APPOINTMENTS),
          where("doctorId", "==", formData.id),
          where("date", ">=", vacation.startDate),
          where("date", "<=", vacation.endDate)
        );

        const snap = await getDocs(q);
        
        // Filter out cancelled appointments
        const activeAppointments = snap.docs.filter((doc) => {
          const data = doc.data() as Appointment;
          return data.status !== "cancelled";
        });

        if (activeAppointments.length > 0) {
          setAffectedAppointments(activeAppointments.length);
          setWarningType("appointments");
          setWarningModalOpen(true);
          setIsChecking(false);
          return;
        }
      } catch (error) {
        console.error("Error checking appointments:", error);
      }
      setIsChecking(false);
    }

    let list = [...vacations];
    if (editingId) {
      list = list.map((v) => (v.id === editingId ? vacation : v));
    } else {
      list.push({
        ...vacation,
        id: crypto.randomUUID(),
      });
    }

    setFormData((prev) => ({
      ...prev,
      vacations: list,
    }));
    resetForm();
    setShowModal(false);
  };`;

vacationContent = vacationContent.replace(handleSaveToReplace, newHandleSave);

const saveButtonToReplace = `              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t("save")}
              </button>`;
const newSaveButton = `              <button
                type="button"
                onClick={handleSave}
                disabled={isChecking}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isChecking ? "..." : t("save")}
              </button>`;

vacationContent = vacationContent.replace(saveButtonToReplace, newSaveButton);

const warningsModal = `      {warningModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold mb-2">
                {warningType === "name"
                  ? t("vacation_name_required_title")
                  : t("appointments_exist_in_vacation_title")}
              </h2>
              <p className="text-slate-600 mb-6">
                {warningType === "name"
                  ? t("vacation_name_required_desc")
                  : t("appointments_exist_in_vacation_desc")}
              </p>
              
              {warningType === "appointments" && (
                <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-xl mb-6 font-medium border border-amber-200">
                  {t("affected_appointments")} {affectedAppointments}
                </div>
              )}

              <button
                type="button"
                onClick={() => setWarningModalOpen(false)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
              >
                {t("ok")}
              </button>
            </div>
          </div>
        </div>
      )}`;

// Inject warnings modal before the last </>
vacationContent = vacationContent.replace('    </>\n  );\n}', warningsModal + '\n    </>\n  );\n}');

fs.writeFileSync(vacationFile, vacationContent);
console.log("Vacation Settings updated successfully.");
