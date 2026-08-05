import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { doctorId } = req.body;

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);

    const db = getFirestore("ai-studio-632711db-3d1d-41f4-bd2c-ab02bf4cc3f6");

    const adminDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // حذف السكرتيرات
    const receptionists = await db
      .collection("users")
      .where("doctorId", "==", doctorId)
      .where("role", "==", "receptionist")
      .get();

    for (const receptionist of receptionists.docs) {
      try {
        await getAuth().deleteUser(receptionist.id);
      } catch {}

      await receptionist.ref.delete();
    }

    // حذف المواعيد
    const appointments = await db
      .collection("appointments")
      .where("doctorId", "==", doctorId)
      .get();

    const batch = db.batch();

    appointments.docs.forEach((doc) => batch.delete(doc.ref));

    // حذف الفترات
    const slots = await db
      .collection("public_slots")
      .where("doctorId", "==", doctorId)
      .get();

    slots.docs.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();

    // حذف الطبيب
    await db.collection("users").doc(doctorId).delete();
    await db.collection("doctors").doc(doctorId).delete();

    try {
      await getAuth().deleteUser(doctorId);
    } catch {}

    return res.json({
      success: true,
    });
  } catch (e: any) {
    return res.status(500).json({
      error: e.message,
    });
  }
}