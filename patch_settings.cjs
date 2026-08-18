const fs = require('fs');

let content = fs.readFileSync('src/pages/doctor/DoctorSettings.tsx', 'utf8');

// 1. Add state variables
if (!content.includes('isMapOpen')) {
  content = content.replace(
    "const [error, setError] = useState('');",
    "const [error, setError] = useState('');\n  const [isMapOpen, setIsMapOpen] = useState(false);\n  const [isLocating, setIsLocating] = useState(false);"
  );
}

// 2. Add handleCurrentLocation function
const handleCurrentLocationFunc = `
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t('geolocation_not_supported', 'تحديد الموقع غير مدعوم في متصفحك'));
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(t('geolocation_error', 'حدث خطأ أثناء تحديد الموقع، يرجى التأكد من منح الصلاحيات'));
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };
`;

if (!content.includes('const handleCurrentLocation')) {
  content = content.replace(
    'if (loading)',
    handleCurrentLocationFunc + '\n if (loading)'
  );
}

// 3. Replace the Clinic Location JSX
const oldLocationJsx = `<label className="block text-sm font-medium text-slate-700 mb-1.5">{t('clinic_location', 'موقع العيادة على الخريطة')}</label>
              <LocationPicker 
                latitude={formData.latitude} 
                longitude={formData.longitude} 
                onLocationChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
              />`;

const newLocationJsx = `<label className="block text-sm font-medium text-slate-700 mb-1.5">{t('clinic_location', 'موقع العيادة على الخريطة')}</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  type="button" 
                  onClick={handleCurrentLocation} 
                  disabled={isLocating}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Navigation className="w-5 h-5" />
                  <span>{isLocating ? t('locating', 'جاري تحديد الموقع...') : t('use_current_location', 'استخدام موقعي الحالي')}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsMapOpen(true)} 
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <MapIcon className="w-5 h-5" />
                  <span>{t('choose_from_map', 'اختيار الموقع من الخريطة')}</span>
                </button>
              </div>
              {formData.latitude && formData.longitude && (
                <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{t('location_selected', 'تم تحديد الموقع بنجاح')}</span>
                </div>
              )}

              {isMapOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">{t('choose_from_map', 'اختيار الموقع من الخريطة')}</h3>
                      <button type="button" onClick={() => setIsMapOpen(false)} className="text-slate-500 hover:text-slate-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <LocationPicker 
                      latitude={formData.latitude} 
                      longitude={formData.longitude} 
                      onLocationChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                    />
                    <div className="mt-6 flex justify-end">
                      <button type="button" onClick={() => setIsMapOpen(false)} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium">
                        {t('confirm', 'تأكيد')}
                      </button>
                    </div>
                  </div>
                </div>
              )}`;

content = content.replace(oldLocationJsx, newLocationJsx);

fs.writeFileSync('src/pages/doctor/DoctorSettings.tsx', content);
