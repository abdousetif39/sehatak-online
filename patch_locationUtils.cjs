const fs = require('fs');

let content = fs.readFileSync('src/utils/locationUtils.ts', 'utf8');

const oldFunc = `export function getCityName(
  state: string | number | undefined,
  city: string | undefined,
  language: string
) {
  if (!city) return "";
  const cities = getCities(state);
  const commune = cities.find(
    c =>
      c.ar === city ||
      c.fr === city
  );
  if (!commune) return city;
  return language.startsWith("fr")
    ? commune.fr
    : commune.ar;
}`;

const newFunc = `export function getCityName(
  state: string | number | undefined,
  city: string | undefined,
  language: string
) {
  if (!city) return "";
  
  let commune = undefined;

  if (state) {
    const cities = getCities(state);
    commune = cities.find(
      c =>
        c.ar === city ||
        c.fr === city ||
        String(c.id) === String(city)
    );
  }

  if (!commune) {
    commune = COMMUNES.find(
      c =>
        c.ar === city ||
        c.fr === city ||
        String(c.id) === String(city)
    );
  }

  if (!commune) return city;

  return language.startsWith("fr") ? commune.fr : commune.ar;
}`;

// Because of potential whitespace differences, let's just use string replace carefully, or use a simpler regex.
const regex = /export function getCityName\([\s\S]*?\}$/m;
content = content.replace(regex, newFunc);
fs.writeFileSync('src/utils/locationUtils.ts', content);
console.log("Patched locationUtils.ts");
