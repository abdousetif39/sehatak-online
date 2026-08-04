const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Home.tsx', 'utf8');

const oldFilter = `    if (selectedState) {
      result = result.filter(d => d.state === selectedState);
    }
    if (selectedCity) {
      result = result.filter(d => d.city === selectedCity);
    }`;

const newFilter = `    if (selectedState) {
      result = result.filter(d => {
        const stateNameAr = getStateName(d.state, 'ar');
        const stateNameFr = getStateName(d.state, 'fr');
        return d.state === selectedState || String(d.state) === selectedState || stateNameAr === selectedState || stateNameFr === selectedState;
      });
    }
    if (selectedCity) {
      result = result.filter(d => {
        const cityNameAr = getCityName(d.state, d.city, 'ar');
        const cityNameFr = getCityName(d.state, d.city, 'fr');
        return d.city === selectedCity || cityNameAr === selectedCity || cityNameFr === selectedCity;
      });
    }`;

content = content.replace(oldFilter, newFilter);
fs.writeFileSync('src/pages/public/Home.tsx', content);
console.log("Patched Home.tsx filter");
