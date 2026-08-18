const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Home.tsx', 'utf8');

// Replace lucide imports
content = content.replace(
  "import { MapPin, Stethoscope, Search, Phone } from 'lucide-react';",
  "import { MapPin, Stethoscope, Search, Phone, Facebook, MessageCircle, Send, Twitter, Linkedin, Mail } from 'lucide-react';"
);

// Inject variables before return
const variablesStr = `
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareTitleText = t('share_msg_title');
  const shareText = \`\${t('share_msg_title')}
\${t('share_msg_desc')}

\${t('share_msg_features')}:
\${t('share_msg_doctors')}:
- \${t('share_feature_d1')}
- \${t('share_feature_d2')}
- \${t('share_feature_d3')}
- \${t('share_feature_d4')}
- \${t('share_feature_d5')}
- \${t('share_feature_d6')}
- \${t('share_feature_d7')}

\${t('share_msg_patients')}:
- \${t('share_feature_p1')}
- \${t('share_feature_p2')}
- \${t('share_feature_p3')}
- \${t('share_feature_p4')}
- \${t('share_feature_p5')}

\${shareUrl}\`;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(shareTitleText);

  const shareLinks = [
    { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, url: \`https://www.facebook.com/sharer/sharer.php?u=\${encodedUrl}\`, color: 'bg-[#1877F2] hover:bg-[#1877F2]/90 text-white' },
    { name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, url: \`https://api.whatsapp.com/send?text=\${encodedText}\`, color: 'bg-[#25D366] hover:bg-[#25D366]/90 text-white' },
    { name: 'Telegram', icon: <Send className="w-5 h-5" />, url: \`https://t.me/share/url?url=\${encodedUrl}&text=\${encodedText}\`, color: 'bg-[#0088cc] hover:bg-[#0088cc]/90 text-white' },
    { name: 'X (Twitter)', icon: <Twitter className="w-5 h-5" />, url: \`https://twitter.com/intent/tweet?url=\${encodedUrl}&text=\${encodedText}\`, color: 'bg-black hover:bg-black/90 text-white' },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, url: \`https://www.linkedin.com/sharing/share-offsite/?url=\${encodedUrl}\`, color: 'bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white' },
    { name: 'Email', icon: <Mail className="w-5 h-5" />, url: \`mailto:?subject=\${encodedTitle}&body=\${encodedText}\`, color: 'bg-slate-600 hover:bg-slate-700 text-white' }
  ];

  return (
`;

content = content.replace("  return (", variablesStr);

// Inject JSX before closing div
const jsxStr = `

      <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 text-center flex flex-col items-center">
        <img src="/logo.png" alt="Sehatak Online Logo" className="h-16 object-contain mb-6" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{t('share_title')}</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">{t('share_desc')}</p>
        <div className="flex flex-wrap justify-center gap-4">
          {shareLinks.map((link, idx) => (
            <a 
              key={idx} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={\`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-transform hover:-translate-y-1 \${link.color}\`}
            >
              {link.icon}
              <span className="hidden sm:inline">{link.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}`;

content = content.replace("    </div>\n  );\n}", jsxStr);

fs.writeFileSync('src/pages/public/Home.tsx', content);
console.log("Patched Home.tsx");
