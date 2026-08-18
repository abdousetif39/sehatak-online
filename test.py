import re

with open('src/pages/admin/AdminSupportChat.tsx', 'r') as f:
    content = f.read()

# Find handleDeleteForMe and handleDeleteForEveryone
print(content[content.find('handleDeleteForMe'):content.find('handleDeleteForMe') + 1000])
print("="*50)
print(content[content.find('handleDeleteForEveryone'):content.find('handleDeleteForEveryone') + 1000])
