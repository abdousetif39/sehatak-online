import re

def patch_file(filepath, is_admin):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add serverTimestamp to deletedAt for everyone
    old_everyone = """        isDeleted: true,
        deletedAt: new Date().toISOString()"""
        
    user_id_str = "user?.id" if is_admin else "user?.uid || user?.id" # Need to check what's available
    
    # Just replace deletedAt: new Date().toISOString() with serverTimestamp() and add deletedBy
    # Wait, in DoctorSupportChat it's user.id
    # In AdminSupportChat it's user?.id
    
    if "user?.id" in content or "user.id" in content:
        # We can just inject deletedBy: user.id
        new_everyone = """        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: user?.id || 'unknown'"""
        content = content.replace(old_everyone, new_everyone)

    # Make sure serverTimestamp is imported
    if 'serverTimestamp' not in content:
        content = content.replace("import { doc, getDoc", "import { doc, getDoc, serverTimestamp")
        content = content.replace("import { doc, updateDoc", "import { doc, updateDoc, serverTimestamp")
        
    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/pages/doctor/DoctorSupportChat.tsx', False)
patch_file('src/pages/admin/AdminSupportChat.tsx', True)
