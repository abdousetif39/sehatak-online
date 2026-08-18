import re

with open('firestore.rules', 'r') as f:
    content = f.read()

# Update messages rules
old_msgs = """        allow update: if isAdmin();
        allow delete: if isAdmin();"""
new_msgs = """        allow update: if isAdmin() || (request.auth != null && get(/databases/$(database)/documents/supportConversations/$(conversationId)).data.doctorId == request.auth.uid);
        allow delete: if isAdmin();"""

content = content.replace(old_msgs, new_msgs)

with open('firestore.rules', 'w') as f:
    f.write(content)
