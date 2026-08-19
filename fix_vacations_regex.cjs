const fs = require('fs');
const vacationFile = 'src/components/doctor/VacationSettings.tsx';
let vacationContent = fs.readFileSync(vacationFile, 'utf8');

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

// Use regex for handleSave because spacing might have caused mismatch
vacationContent = vacationContent.replace(/const handleSave = \(\) => {[\s\S]*?setShowModal\(false\);\s*};/, newHandleSave);

fs.writeFileSync(vacationFile, vacationContent);
console.log("Updated handleSave with regex");
