const fs = require('fs');

// App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace("import AuthLayout from './pages/Auth';", "const AuthLayout = React.lazy(() => import('./pages/Auth'));");
appCode = appCode.replace("import AdminLayout from './pages/Admin';", "const AdminLayout = React.lazy(() => import('./pages/Admin'));");
appCode = appCode.replace("import DoctorLayout from './pages/Doctor';", "const DoctorLayout = React.lazy(() => import('./pages/Doctor'));");

if (!appCode.includes("Suspense fallback")) {
    appCode = appCode.replace(
        "<Routes>",
        "<React.Suspense fallback={<div className=\"p-8 text-center\">{t('loading')}</div>}>\n          <Routes>"
    );
    appCode = appCode.replace(
        "</Routes>",
        "</Routes>\n          </React.Suspense>"
    );
}

fs.writeFileSync('src/App.tsx', appCode);

// Public.tsx
let pubCode = fs.readFileSync('src/pages/Public.tsx', 'utf8');
pubCode = pubCode.replace("import DoctorProfile from './public/DoctorProfile';", "import React, { Suspense } from 'react';\nconst DoctorProfile = React.lazy(() => import('./public/DoctorProfile'));");
pubCode = pubCode.replace("import Pricing from './public/Pricing';", "const Pricing = React.lazy(() => import('./public/Pricing'));");

if (!pubCode.includes("<Suspense fallback")) {
    pubCode = pubCode.replace(
        "<Routes>",
        "<Suspense fallback={<div className=\"flex justify-center p-12\"><div className=\"w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin\"></div></div>}>\n        <Routes>"
    );
    pubCode = pubCode.replace(
        "</Routes>",
        "</Routes>\n        </Suspense>"
    );
}

fs.writeFileSync('src/pages/Public.tsx', pubCode);
console.log("Patched lazy loading");
