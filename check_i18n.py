import re
import json

with open('src/pages/admin/AdminSupportChat.tsx', 'r') as f:
    admin_content = f.read()

with open('src/pages/doctor/DoctorSupportChat.tsx', 'r') as f:
    doctor_content = f.read()

with open('src/locales/ar.json', 'r') as f:
    ar_keys = set(json.load(f).keys())

with open('src/locales/fr.json', 'r') as f:
    fr_keys = set(json.load(f).keys())

t_pattern = re.compile(r"t\(\s*['\"](.*?)['\"]\s*\)")
all_t_calls = set(t_pattern.findall(admin_content)) | set(t_pattern.findall(doctor_content))

missing_ar = all_t_calls - ar_keys
missing_fr = all_t_calls - fr_keys

print(f"Missing in AR: {missing_ar}")
print(f"Missing in FR: {missing_fr}")
