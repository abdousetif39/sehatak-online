const fs = require('fs');
let content = fs.readFileSync('src/utils/locationUtils.ts', 'utf8');

const regex = /export function getCityName\([\s\S]*?export function getCityArabicName/m;

const newFunc = `export function getCityName(
  state: string | number | undefined,
  city: string | undefined,
  language: string
) {
  if (!city) return "";
  
  let commune = undefined;

  if (state) {
    const cities = getCities(state);
    commune = cities.find(c => c.ar === city || c.fr === city);
  }

  if (!commune) {
    commune = COMMUNES.find(c => c.ar === city || c.fr === city);
  }

  if (!commune) return city;

  return language.startsWith("fr") ? commune.fr : commune.ar;
}

export function getCityArabicName`;

content = content.replace(regex, newFunc);
fs.writeFileSync('src/utils/locationUtils.ts', content);
console.log("Patched locationUtils.ts cleanly");
