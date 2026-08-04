const fs = require('fs');
let content = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');

const oldPhoneBlock = `              <label className="mt-3 flex items-center gap-3 cursor-pointer">
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
              </label>`;

const newPhoneBlock = `              <label className="mt-3 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="showPhoneInCard"
                  checked={formData.showPhoneInCard || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-slate-700 font-medium">{t('show_phone_in_card', 'إظهار رقم الهاتف للمرضى')}</span>
              </label>`;

content = content.replace(oldPhoneBlock, newPhoneBlock);
fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', content);
console.log("Patched DoctorSettings.tsx with simple checkbox");
