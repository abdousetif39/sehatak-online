import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
try {
  initializeApp();
  const list = await getAuth().listUsers(10);
  console.log("Users:", list.users.length);
} catch(e) {
  console.error("List users failed:", e.message);
}
