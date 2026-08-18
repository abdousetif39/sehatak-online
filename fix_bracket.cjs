const fs = require('fs');

let content = fs.readFileSync('src/pages/doctor/Calendar.tsx', 'utf8');

// I'll just check if it parses, if not, I'll log what the issue could be.
