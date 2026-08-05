const fs = require('fs');

// index.css
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace("@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');", "");
fs.writeFileSync('src/index.css', css);

// index.html
let html = fs.readFileSync('index.html', 'utf8');
const fontLinks = `    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet" />`;
html = html.replace('<title>صحتك أونلاين</title>', fontLinks + '\n    <title>صحتك أونلاين</title>');
fs.writeFileSync('index.html', html);
console.log("Patched font");
