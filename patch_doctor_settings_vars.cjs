const fs = require('fs');

let content = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');

const stateRegex = /const \[receptionists, setReceptionists\] = useState<any\[\]>\(\[\]\);/;
const stateToAdd = `const [receptionists, setReceptionists] = useState<any[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);`;

if (content.match(stateRegex)) {
  content = content.replace(stateRegex, stateToAdd);
  fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', content);
  console.log("Success replacing variables");
} else {
  console.log("Could not find receptionists state");
}

