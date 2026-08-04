const fs = require('fs');
let content = fs.readFileSync('src/pages/Public.tsx', 'utf8');

const targetStr = `<div className="flex items-center gap-4">
            <button onClick={toggleLanguage}`;

const replacementStr = `<div className="flex items-center gap-4">
            <Link to="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {t('subscription_plans')}
            </Link>
            <button onClick={toggleLanguage}`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync('src/pages/Public.tsx', content);
console.log("Patched Public.tsx");
