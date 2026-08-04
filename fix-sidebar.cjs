const fs = require('fs');

function fixSidebar(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // The current class we need to replace
  const matchClass = /<aside className=\{\`fixed md:static inset-y-0 ltr:left-0 rtl:right-0 z-50 w-64 bg-white ltr:border-r rtl:border-l border-slate-200 p-6 flex flex-col gap-2 shrink-0 transition-transform duration-300 ease-in-out md:!transform-none \$\{isSidebarOpen \? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'\}\`\}>/;
  
  const newClass = `<aside className={\`fixed md:static inset-y-0 ltr:left-0 rtl:right-0 z-50 w-64 bg-white ltr:border-r rtl:border-l border-slate-200 p-6 flex flex-col gap-2 shrink-0 transition-transform duration-300 ease-in-out \${isSidebarOpen ? 'translate-x-0' : 'max-md:ltr:-translate-x-full max-md:rtl:translate-x-full'}\`}>`;

  if (content.match(matchClass)) {
    content = content.replace(matchClass, newClass);
    fs.writeFileSync(file, content);
    console.log(`Fixed sidebar in ${file}`);
  } else {
    console.log(`Could not find sidebar class in ${file}`);
    // Maybe it was modified differently, let's use a more robust regex
    const fallbackRegex = /<aside className=\{\`fixed md:static [^\}]+\}\`\}>/;
    if (content.match(fallbackRegex)) {
        content = content.replace(fallbackRegex, newClass);
        fs.writeFileSync(file, content);
        console.log(`Fixed sidebar with fallback regex in ${file}`);
    }
  }
}

fixSidebar('src/pages/Doctor.tsx');
fixSidebar('src/pages/Admin.tsx');
