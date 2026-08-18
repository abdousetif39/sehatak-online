const fs = require('fs');

function patchLayout(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Add useState import
  if (!content.includes('useState')) {
    content = content.replace("import { Routes", "import { useState } from 'react';\nimport { Routes");
  }

  // Add Menu to lucide-react imports if not there
  if (!content.includes('Menu,')) {
    content = content.replace("LogOut,", "LogOut, Menu,");
  }

  // Add state
  if (!content.includes('isSidebarOpen')) {
    content = content.replace(
      "const { t, i18n } = useTranslation();",
      "const { t, i18n } = useTranslation();\n  const [isSidebarOpen, setIsSidebarOpen] = useState(false);"
    );
  }

  // Add hamburger button
  const hamburgerButton = `
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <img src="/logo.png"
`;
  if (!content.includes('<Menu className')) {
    content = content.replace(
      `<div className="flex items-center gap-2">
            <img src="/logo.png"`,
      hamburgerButton
    );
  }

  // Update aside and add overlay
  const oldAside = `<aside className="w-64 bg-white border-l rtl:border-l-0 ltr:border-r border-slate-200 p-6 flex flex-col gap-2 hidden md:flex shrink-0">`;
  const newAside = `{/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <aside className={\`fixed md:static inset-y-0 ltr:left-0 rtl:right-0 z-50 w-64 bg-white ltr:border-r rtl:border-l border-slate-200 p-6 flex flex-col gap-2 shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 \${isSidebarOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}\`}>`;

  if (content.includes(oldAside)) {
    content = content.replace(oldAside, newAside);
  }

  // Update Link to close sidebar on click
  if (!content.includes('onClick={() => setIsSidebarOpen(false)}')) {
    content = content.replace(
      /<Link\s+key=\{item\.path\}\s+to=\{item\.path\}/g,
      '<Link\n                onClick={() => setIsSidebarOpen(false)}\n                key={item.path}\n                to={item.path}'
    );
  }

  fs.writeFileSync(file, content);
}

patchLayout('src/pages/Doctor.tsx');
patchLayout('src/pages/Admin.tsx');
