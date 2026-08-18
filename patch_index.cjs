const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const metaTags = `    <title>صحتك أونلاين</title>
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="صحتك أونلاين" />
    <meta property="og:description" content="منصة متكاملة لإدارة العيادات الطبية وحجز المواعيد عبر الإنترنت." />
    <meta property="og:image" content="/logo.png" />
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="صحتك أونلاين" />
    <meta property="twitter:description" content="منصة متكاملة لإدارة العيادات الطبية وحجز المواعيد عبر الإنترنت." />
    <meta property="twitter:image" content="/logo.png" />`;

content = content.replace('    <title>صحتك أونلاين</title>', metaTags);
fs.writeFileSync('index.html', content);
console.log("Patched index.html");
