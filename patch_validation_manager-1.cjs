const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/DoctorsManager.tsx', 'utf8');

content = content.replace(
  /value={firstNameAr} onChange={e => setFirstNameAr\(e.target.value\)} className=/g,
  'value={firstNameAr} onChange={e => setFirstNameAr(e.target.value)} pattern="^[\\\\u0600-\\\\u06FF\\\\s]+$" title="يرجى إدخال حروف عربية فقط" className='
);
content = content.replace(
  /value={lastNameAr} onChange={e => setLastNameAr\(e.target.value\)} className=/g,
  'value={lastNameAr} onChange={e => setLastNameAr(e.target.value)} pattern="^[\\\\u0600-\\\\u06FF\\\\s]+$" title="يرجى إدخال حروف عربية فقط" className='
);
content = content.replace(
  /value={firstNameFr} onChange={e => setFirstNameFr\(e.target.value\)} className=/g,
  'value={firstNameFr} onChange={e => setFirstNameFr(e.target.value)} pattern="^[A-Za-zÀ-ÖØ-öø-ÿ\\\\s]+$" title="Please enter Latin characters only" className='
);
content = content.replace(
  /value={lastNameFr} onChange={e => setLastNameFr\(e.target.value\)} className=/g,
  'value={lastNameFr} onChange={e => setLastNameFr(e.target.value)} pattern="^[A-Za-zÀ-ÖØ-öø-ÿ\\\\s]+$" title="Please enter Latin characters only" className='
);

fs.writeFileSync('src/pages/admin/DoctorsManager.tsx', content);
