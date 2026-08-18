def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Import serverTimestamp if missing or fix import
    if "import { doc, getDoc, serverTimestamp" in content:
        content = content.replace("import { doc, getDoc, serverTimestamp", "import { doc, getDoc, serverTimestamp,")

    if "serverTimestamp" not in content[:1000]: # Look in the first 1000 chars for imports
        content = content.replace("import { doc,", "import { doc, serverTimestamp,")
        content = content.replace("import { doc ", "import { doc, serverTimestamp ")
        content = content.replace("import { updateDoc,", "import { updateDoc, serverTimestamp,")

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/pages/Doctor.tsx')
patch_file('src/pages/admin/AdminSupportChat.tsx')
