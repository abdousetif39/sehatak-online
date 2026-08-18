const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const prefix = content.substring(0, content.indexOf('// Sitemap endpoint'));
const suffix = content.substring(content.indexOf('async function startServer() {'));

const sitemapRoute = `// Sitemap endpoint
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
      return res.type('application/xml').send(\`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.sehatek.online/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.sehatek.online/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>\`);
    }

    const db = getFirestore(databaseId);
    const doctorsSnapshot = await db.collection('doctors').get();
    
    let xml = \`<?xml version="1.0" encoding="UTF-8"?>\\n\`;
    xml += \`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n\`;
    
    xml += \`  <url>\\n\`;
    xml += \`    <loc>https://www.sehatek.online/</loc>\\n\`;
    xml += \`    <changefreq>daily</changefreq>\\n\`;
    xml += \`    <priority>1.0</priority>\\n\`;
    xml += \`  </url>\\n\`;
    
    xml += \`  <url>\\n\`;
    xml += \`    <loc>https://www.sehatek.online/pricing</loc>\\n\`;
    xml += \`    <changefreq>monthly</changefreq>\\n\`;
    xml += \`    <priority>0.8</priority>\\n\`;
    xml += \`  </url>\\n\`;

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
      
      xml += \`  <url>\\n\`;
      xml += \`    <loc>https://www.sehatek.online/doctors/\${slug}</loc>\\n\`;
      xml += \`    <lastmod>\${lastmod}</lastmod>\\n\`;
      xml += \`    <changefreq>weekly</changefreq>\\n\`;
      xml += \`    <priority>0.8</priority>\\n\`;
      xml += \`  </url>\\n\`;
    });
    
    xml += \`</urlset>\`;
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).end();
  }
});
\n`;

fs.writeFileSync('server.ts', prefix + sitemapRoute + suffix);
console.log("Replaced sitemap endpoint completely");
