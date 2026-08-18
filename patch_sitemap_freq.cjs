const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace homepage static
content = content.replace(
  /<loc>https:\/\/www\.sehatek\.online\/<\/loc>\n\s*<changefreq>weekly<\/changefreq>/g,
  "<loc>https://www.sehatek.online/</loc>\\n    <changefreq>daily</changefreq>"
);

// Replace pricing static
content = content.replace(
  /<loc>https:\/\/www\.sehatek\.online\/pricing<\/loc>\n\s*<changefreq>weekly<\/changefreq>/g,
  "<loc>https://www.sehatek.online/pricing</loc>\\n    <changefreq>monthly</changefreq>"
);

// Replace dynamic homepage
content = content.replace(
  /xml \+= \`    <loc>https:\/\/www\.sehatek\.online\/<\/loc>\\n\`;\n\s*xml \+= \`    <changefreq>weekly<\/changefreq>\\n\`;/g,
  "xml += \`    <loc>https://www.sehatek.online/</loc>\\\\n\`;\\n    xml += \`    <changefreq>daily</changefreq>\\\\n\`;"
);

// Replace dynamic pricing
content = content.replace(
  /xml \+= \`    <loc>https:\/\/www\.sehatek\.online\/pricing<\/loc>\\n\`;\n\s*xml \+= \`    <changefreq>weekly<\/changefreq>\\n\`;/g,
  "xml += \`    <loc>https://www.sehatek.online/pricing</loc>\\\\n\`;\\n    xml += \`    <changefreq>monthly</changefreq>\\\\n\`;"
);

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts changefreq");
