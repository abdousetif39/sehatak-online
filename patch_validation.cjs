const fs = require('fs');

function addValidation(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(
    /name="firstNameAr"(.*?)className=/g,
    'name="firstNameAr" pattern="^[\\\\u0600-\\\\u06FF\\\\s]+$"\ntitle="يرجى إدخال حروف عربية فقط"\n$1className='
  );
  
  content = content.replace(
    /name="lastNameAr"(.*?)className=/g,
    'name="lastNameAr" pattern="^[\\\\u0600-\\\\u06FF\\\\s]+$"\ntitle="يرجى إدخال حروف عربية فقط"\n$1className='
  );
  
  content = content.replace(
    /name="firstNameFr"(.*?)className=/g,
    'name="firstNameFr" pattern="^[A-Za-zÀ-ÖØ-öø-ÿ\\\\s]+$"\ntitle="Please enter Latin characters only"\n$1className='
  );
  
  content = content.replace(
    /name="lastNameFr"(.*?)className=/g,
    'name="lastNameFr" pattern="^[A-Za-zÀ-ÖØ-öø-ÿ\\\\s]+$"\ntitle="Please enter Latin characters only"\n$1className='
  );
  
  fs.writeFileSync(file, content);
}

addValidation('src/pages/doctor/DoctorSettings.tsx');
addValidation('src/pages/admin/DoctorsManager.tsx');
