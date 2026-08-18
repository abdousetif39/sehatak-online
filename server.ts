import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const app = express();
const PORT = 3000;

app.use(express.json());

// Cloudinary signature endpoint
app.get('/api/cloudinary-signature', (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
      return res.status(500).json({ error: 'Cloudinary configuration is missing' });
    }

    const signature = crypto.createHash('sha1').update(`timestamp=${timestamp}${apiSecret}`).digest('hex');

    res.json({ timestamp, signature, apiKey, cloudName });
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Initialize Firebase Admin
// Make sure to add these to your environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (projectId && clientEmail && privateKey) {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("Firebase Admin initialized successfully.");
  }
} else {
  console.warn("Firebase Admin credentials not found in environment variables. Admin API routes will fail.");
}

// Secure Delete Doctor Endpoint
app.post('/api/delete-doctor', async (req, res) => {
  try {
    const { doctorId } = req.body;
    // Basic auth check: In a real app, verify the caller is an admin using ID token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify caller is an admin in Firestore
    let databaseId = "(default)";
    try {
      const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
      if (config.firestoreDatabaseId) databaseId = config.firestoreDatabaseId;
    } catch (e) {
      // Ignore
    }
    const db = getFirestore(databaseId);
    const callerDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin only' });
    }

    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required' });
    }

    console.log(`Starting secure deletion for doctor: ${doctorId}`);
    
    // 1. Delete all receptionist accounts linked to that doctor
    const receptionistsSnapshot = await db.collection('users')
      .where('doctorId', '==', doctorId)
      .where('role', '==', 'receptionist')
      .get();
      
    for (const doc of receptionistsSnapshot.docs) {
      const recId = doc.id;
      // Delete from Auth
      try {
        await getAuth().deleteUser(recId);
        console.log(`Deleted receptionist from Auth: ${recId}`);
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found') {
          console.log(`Receptionist already removed from Auth: ${recId}`);
        } else {
          console.error(`Failed to delete receptionist from Auth: ${recId}`, authError);
        }
      }
      // Delete from Firestore
      await doc.ref.delete();
    }

    // 2. Delete all appointments belonging to the doctor
    const appointmentsSnapshot = await db.collection('appointments').where('doctorId', '==', doctorId).get();
    const batch = db.batch();
    appointmentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // 3. Delete all public slots
    const slotsSnapshot = await db.collection('public_slots').where('doctorId', '==', doctorId).get();
    slotsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    // Commit batch deletes for appointments and slots
    await batch.commit();

    // 4. Delete the Firestore document in users
    await db.collection('users').doc(doctorId).delete();
    
    // 5. Delete the Firestore document in doctors
    await db.collection('doctors').doc(doctorId).delete();

    // 6. Delete the user from Firebase Authentication
    try {
      await getAuth().deleteUser(doctorId);
      console.log(`Deleted doctor from Auth: ${doctorId}`);
    } catch (authError: any) {
      if (authError.code === 'auth/user-not-found') {
        console.log(`Doctor already removed from Auth: ${doctorId}`);
      } else {
        console.error(`Failed to delete doctor from Auth: ${doctorId}`, authError);
      }
    }

    res.json({ success: true, message: 'Doctor completely deleted' });
  } catch (error: any) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: error.message });
  }
});


// robots.txt endpoint
// robots.txt endpoint
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /doctor/\nDisallow: /login\nSitemap: https://www.sehatek.online/sitemap.xml\n`);
});

// Sitemap endpoint
app.get('/sitemap.xml', async (req, res) => {
  try {
    let databaseId = "(default)";
    try {
      const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
      if (config.firestoreDatabaseId) databaseId = config.firestoreDatabaseId;
    } catch (e) {
      // Ignore
    }
    
    // Check if firebase admin is initialized
    const apps = getApps();
    if (apps.length === 0) {
      console.warn("Firebase Admin not initialized. Returning static sitemap.");
      return res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.sehatek.online/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
    }

    const db = getFirestore(databaseId);
    const doctorsSnapshot = await db.collection('doctors').get();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    xml += `  <url>\n`;
    xml += `    <loc>https://www.sehatek.online/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    const today = new Date().toISOString().split('T')[0];
    
    doctorsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      let lastmod = today;
      if (data.updatedAt) {
        if (typeof data.updatedAt.toDate === 'function') {
          lastmod = data.updatedAt.toDate().toISOString().split('T')[0];
        } else if (typeof data.updatedAt === 'string') {
          lastmod = data.updatedAt.split('T')[0];
        }
      }
      
      xml += `  <url>\n`;
      xml += `    <loc>https://www.sehatek.online/doctors/${slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });
    
    xml += `</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).end();
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
