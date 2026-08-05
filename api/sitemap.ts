import type { VercelRequest, VercelResponse } from "@vercel/node";

import { initializeApp, getApps, cert } from "firebase-admin/app";
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
  const db = getFirestore();

  const snapshot = await db.collection("doctors").get();

  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  xml += `
  <url>
    <loc>https://www.sehatek.online/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>`;

  xml += `
  <url>
    <loc>https://www.sehatek.online/pricing</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>`;

  snapshot.forEach((doc) => {
    const data = doc.data();

    const slug = data.slug || doc.id;

    xml += `
    <url>
      <loc>https://www.sehatek.online/doctors/${slug}</loc>
      <lastmod>${today}</lastmod>
      <priority>0.8</priority>
      <changefreq>weekly</changefreq>
    </url>`;
  });

  xml += `</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(xml);
}