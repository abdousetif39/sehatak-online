import re

with open('src/pages/doctor/DoctorSupportChat.tsx', 'r') as f:
    content = f.read()

# Fix the readAt logic
old_block1 = """           const now = new Date().toISOString();
           const batch = writeBatch(db);
           let hasUpdates = false;

           // 1. Update individual messages from admin that are unread
           const unreadAdminMsgs = newMsgs.filter(m => m.senderId === 'admin' && !m.readAt);
           for (const msg of unreadAdminMsgs) {
             const msgRef = doc(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${conversationId}/messages`, msg.id);
             batch.update(msgRef, { readAt: now });
             hasUpdates = true;
           }
           
           if (hasUpdates) {
             await batch.commit();
           }

           // 2. Check for broadcast messages to mark as read in tracking collection
           const broadcastsToMark = unreadAdminMsgs.filter(m => m.broadcastId);
           if (broadcastsToMark.length > 0) {
             const bBatch = writeBatch(db);
             let hasBUpdates = false;
             for (const msg of broadcastsToMark) {
               const recipientRef = doc(db, COLLECTIONS.BROADCAST_RECIPIENTS, `${msg.broadcastId}_${user?.id}`);
               const rSnap = await getDoc(recipientRef);
               if (rSnap.exists() && !rSnap.data().readAt) {
                 bBatch.update(recipientRef, { readAt: now });
                 hasBUpdates = true;
               }
             }
             if (hasBUpdates) await bBatch.commit();
           }"""

new_block1 = """           const batch = writeBatch(db);
           let hasUpdates = false;

           // 1. Update individual messages from admin that are unread
           const unreadAdminMsgs = newMsgs.filter(m => m.senderId === 'admin' && !m.readAt);
           for (const msg of unreadAdminMsgs) {
             const msgRef = doc(db, `${COLLECTIONS.SUPPORT_CONVERSATIONS}/${conversationId}/messages`, msg.id);
             batch.update(msgRef, { readAt: serverTimestamp() });
             hasUpdates = true;
           }
           
           if (hasUpdates) {
             await batch.commit();
           }

           // 2. Check for broadcast messages to mark as read in tracking collection
           const broadcastsToMark = unreadAdminMsgs.filter(m => m.broadcastId);
           if (broadcastsToMark.length > 0) {
             const bBatch = writeBatch(db);
             let hasBUpdates = false;
             for (const msg of broadcastsToMark) {
               const recipientRef = doc(db, COLLECTIONS.BROADCAST_RECIPIENTS, `${msg.broadcastId}_${user?.id}`);
               const rSnap = await getDoc(recipientRef);
               if (rSnap.exists() && !rSnap.data().readAt) {
                 bBatch.update(recipientRef, { readAt: serverTimestamp() });
                 hasBUpdates = true;
               }
             }
             if (hasBUpdates) await bBatch.commit();
           }"""

if old_block1 in content:
    content = content.replace(old_block1, new_block1)
else:
    print("Could not find block 1 in DoctorSupportChat.tsx")

old_block2 = """        if (lastBroadcast.broadcastId) {
          const recipientRef = doc(db, COLLECTIONS.BROADCAST_RECIPIENTS, `${lastBroadcast.broadcastId}_${user.id}`);
          const rSnap = await getDoc(recipientRef);
          if (rSnap.exists() && !rSnap.data().repliedAt) {
            await updateDoc(recipientRef, { repliedAt: new Date().toISOString() });
          }
        }"""
        
new_block2 = """        if (lastBroadcast.broadcastId) {
          const recipientRef = doc(db, COLLECTIONS.BROADCAST_RECIPIENTS, `${lastBroadcast.broadcastId}_${user.id}`);
          const rSnap = await getDoc(recipientRef);
          if (rSnap.exists() && !rSnap.data().repliedAt) {
            await updateDoc(recipientRef, { repliedAt: serverTimestamp() });
          }
        }"""

if old_block2 in content:
    content = content.replace(old_block2, new_block2)
else:
    print("Could not find block 2 in DoctorSupportChat.tsx")

with open('src/pages/doctor/DoctorSupportChat.tsx', 'w') as f:
    f.write(content)
