const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const robotsRoute = `// robots.txt endpoint
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(\`User-agent: *
Allow: /

Disallow: /admin/
Disallow: /doctor/
Disallow: /login

Sitemap: https://www.sehatek.online/sitemap.xml\`);
});

`;

content = content.replace("// Sitemap endpoint", robotsRoute + "// Sitemap endpoint");

fs.writeFileSync('server.ts', content);
console.log("Added robots.txt endpoint");
