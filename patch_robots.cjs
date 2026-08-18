const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(
  "app.get('/robots.txt', (req, res) => {\n  res.type('text/plain');\n  res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /doctor/\nDisallow: /login\nSitemap: https://www.sehatek.online/sitemap.xml`);\n});",
  "app.get('/robots.txt', (req, res) => {\n  res.type('text/plain');\n  res.send(`User-agent: *\\nAllow: /\\nDisallow: /admin/\\nDisallow: /doctor/\\nDisallow: /login\\nSitemap: https://www.sehatek.online/sitemap.xml\\n`);\n});"
);

fs.writeFileSync('server.ts', serverCode);
console.log("Patched server.ts robots.txt");
