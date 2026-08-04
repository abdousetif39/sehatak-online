import fs from 'fs';
import pkg from 'algeria-wilayas-communes';

const wilayas = pkg.getWilayas().map(w => ({
  id: w.wilaya_num,
  ar: w.nom_ar,
  fr: w.nom_fr
}));

const communes = pkg.getCommunes().map(c => ({
  w_id: c.wilaya_num,
  ar: c.nom_ar,
  fr: c.nom_fr
}));

const content = `export const WILAYAS = ${JSON.stringify(wilayas, null, 2)};\nexport const COMMUNES = ${JSON.stringify(communes, null, 2)};\n`;
fs.writeFileSync('src/data/algeria-data.ts', content);
