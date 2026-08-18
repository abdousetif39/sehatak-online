const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Pricing.tsx', 'utf8');

const targetStr6Months = `<p className="text-slate-900 font-medium mb-4">{t('includes')}</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-600 text-sm">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{t('includes_all_features')}</span>
              </li>
            </ul>`;

const replacementStr6Months = `<p className="text-slate-900 font-medium mb-4">{t('includes')}</p>
            <ul className="space-y-3">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>`;

content = content.replace(targetStr6Months, replacementStr6Months).replace(targetStr6Months, replacementStr6Months);

fs.writeFileSync('src/pages/public/Pricing.tsx', content);
console.log("Patched Pricing.tsx");
