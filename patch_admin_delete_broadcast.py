import re

with open('src/pages/admin/AdminSupportChat.tsx', 'r') as f:
    content = f.read()

old_block = """  const handleDeleteBroadcast = async () => {
    if (!selectedBroadcast) return;
    try {
      await updateDoc(doc(db, COLLECTIONS.BROADCAST_MESSAGES, selectedBroadcast.id), {
        isDeleted: true,
        deletedAt: new Date().toISOString()
      });"""

new_block = """  const handleDeleteBroadcast = async () => {
    if (!selectedBroadcast) return;
    try {
      await updateDoc(doc(db, COLLECTIONS.BROADCAST_MESSAGES, selectedBroadcast.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: user?.id || 'unknown'
      });"""

if old_block in content:
    content = content.replace(old_block, new_block)
else:
    print("Could not find block in AdminSupportChat.tsx")

with open('src/pages/admin/AdminSupportChat.tsx', 'w') as f:
    f.write(content)
