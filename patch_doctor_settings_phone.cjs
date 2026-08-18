const fs = require('fs');
let content = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');

const oldPhoneBlock = `            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('phone')}</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" dir="ltr" />
            </div>`;

const newPhoneBlock = `            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('phone')}</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" dir="ltr" />
              <label className="mt-3 flex items-center gap-3 cursor-pointer">
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="showPhoneInCard"
                    checked={formData.showPhoneInCard || false}
                    onChange={handleChange}
                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-200 checked:right-0 checked:border-blue-600 focus:outline-none transition-all duration-300"
                    style={{
                      right: formData.showPhoneInCard ? '0' : '1.25rem',
                      borderColor: formData.showPhoneInCard ? '#2563eb' : '#e2e8f0',
                      backgroundColor: '#fff',
                      borderWidth: formData.showPhoneInCard ? '5px' : '1px'
                    }}
                  />
                  <div className={\`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-300 \${formData.showPhoneInCard ? 'bg-blue-600' : 'bg-slate-200'}\`}></div>
                </div>
                <span className="text-sm text-slate-700 font-medium">إظهار رقم الهاتف للمرضى</span>
              </label>
            </div>`;

content = content.replace(oldPhoneBlock, newPhoneBlock);
fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', content);
console.log("Patched DoctorSettings.tsx");
