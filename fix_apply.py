import re

with open('src/pages/admin/AdminSupportChat.tsx', 'r') as f:
    content = f.read()

# I replaced match 2 with '    return () => unsub();\n'
# It was around line 167. I should replace it with '    return { doctor, conv };\n'
content = re.sub(
    r'const conv = conversations\.find\(c => c\.doctorId === doctor\.id\);\n    return \(\) => unsub\(\);\n  \}\)\.sort\(\(a, b\) => \{',
    r'const conv = conversations.find(c => c.doctorId === doctor.id);\n    return { doctor, conv };\n  }).sort((a, b) => {',
    content
)

with open('src/pages/admin/AdminSupportChat.tsx', 'w') as f:
    f.write(content)
