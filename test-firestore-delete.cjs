const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

const db = getFirestore();

async function run() {
  try {
    const doc = await db.collection('test').doc('nonexistent1').get();
    console.log("Get passed, exists:", doc.exists);
  } catch (e) {
    console.error("Error on get:", e);
  }
}
run();
