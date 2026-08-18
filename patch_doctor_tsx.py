import re

with open('src/pages/Doctor.tsx', 'r') as f:
    content = f.read()

# Make sure serverTimestamp is imported from firebase/firestore
if 'serverTimestamp' not in content:
    content = content.replace("import { doc, getDoc, collection, query, where, onSnapshot, writeBatch, getDocs } from 'firebase/firestore';", "import { doc, getDoc, collection, query, where, onSnapshot, writeBatch, getDocs, serverTimestamp } from 'firebase/firestore';")
    content = content.replace("import { doc, onSnapshot, collection, query, where, getDocs, writeBatch, getDoc } from 'firebase/firestore';", "import { doc, onSnapshot, collection, query, where, getDocs, writeBatch, getDoc, serverTimestamp } from 'firebase/firestore';")

# Fix the deliveredAt logic
old_block = """            const now = new Date().toISOString();
            const batch = writeBatch(db);
            let hasUpdates = false;

            for (const mDoc of msgsSnap.docs) {
              const data = mDoc.data();
              if (!data.deliveredAt && !data.readAt) {
                batch.update(mDoc.ref, { deliveredAt: now });
                hasUpdates = true;

                // Check broadcast
                if (data.broadcastId) {
                  const bRef = doc(db, COLLECTIONS.BROADCAST_RECIPIENTS, `${data.broadcastId}_${user.id}`);
                  const bSnap = await getDoc(bRef);
                  if (bSnap.exists() && !bSnap.data().deliveredAt) {
                    batch.update(bRef, { deliveredAt: now });
                  }
                }
              }
            }"""

new_block = """            const batch = writeBatch(db);
            let hasUpdates = false;

            for (const mDoc of msgsSnap.docs) {
              const data = mDoc.data();
              if (!data.deliveredAt && !data.readAt) {
                batch.update(mDoc.ref, { deliveredAt: serverTimestamp() });
                hasUpdates = true;

                // Check broadcast
                if (data.broadcastId) {
                  const bRef = doc(db, COLLECTIONS.BROADCAST_RECIPIENTS, `${data.broadcastId}_${user.id}`);
                  const bSnap = await getDoc(bRef);
                  if (bSnap.exists() && !bSnap.data().deliveredAt) {
                    batch.update(bRef, { deliveredAt: serverTimestamp() });
                  }
                }
              }
            }"""

if old_block in content:
    content = content.replace(old_block, new_block)
else:
    print("Could not find block in Doctor.tsx")

with open('src/pages/Doctor.tsx', 'w') as f:
    f.write(content)
