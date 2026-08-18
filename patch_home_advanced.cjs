const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Home.tsx', 'utf8');

// Replace lucide imports
content = content.replace(
  "import { MapPin, Stethoscope, Search, Phone, Facebook, MessageCircle, Send, Twitter, Linkedin, Mail } from 'lucide-react';",
  "import { MapPin, Stethoscope, Search, Phone, Facebook, MessageCircle, Send, Twitter, Linkedin, Mail, Link as LinkIcon, CheckCircle2, Calendar, Users, Globe, Clock } from 'lucide-react';"
);

content = content.replace(
  "import { MapPin, Stethoscope, Search, Phone } from 'lucide-react';",
  "import { MapPin, Stethoscope, Search, Phone, Facebook, MessageCircle, Send, Twitter, Linkedin, Mail, Link as LinkIcon, CheckCircle2, Calendar, Users, Globe, Clock } from 'lucide-react';"
);


// Add copied state to Home
content = content.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n  const [copied, setCopied] = useState(false);"
);

// Update shareUrl block and shareLinks
const oldShareBlockStr = `  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
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
  ];`;


const newShareBlockStr = `  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
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
    { name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />, url: \`https://api.whatsapp.com/send?text=\${encodedText}\`, color: 'bg-[#25D366] hover:bg-[#1da851] text-white' },
    { name: 'Facebook', icon: <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />, url: \`https://www.facebook.com/sharer/sharer.php?u=\${encodedUrl}\`, color: 'bg-[#1877F2] hover:bg-[#145dbf] text-white' },
    { name: 'Telegram', icon: <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />, url: \`https://t.me/share/url?url=\${encodedUrl}&text=\${encodedText}\`, color: 'bg-[#0088cc] hover:bg-[#006699] text-white' },
    { name: 'X', icon: <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />, url: \`https://twitter.com/intent/tweet?url=\${encodedUrl}&text=\${encodedText}\`, color: 'bg-black hover:bg-gray-800 text-white' },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />, url: \`https://www.linkedin.com/sharing/share-offsite/?url=\${encodedUrl}\`, color: 'bg-[#0A66C2] hover:bg-[#074c92] text-white' },
    { name: 'Email', icon: <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />, url: \`mailto:?subject=\${encodedTitle}&body=\${encodedText}\`, color: 'bg-slate-600 hover:bg-slate-700 text-white' }
  ];
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };`;

content = content.replace(oldShareBlockStr, newShareBlockStr);


const oldJSXShareStr = `      <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 text-center flex flex-col items-center">
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
      </div>`;

const newJSXShareStr = `      <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 flex flex-col items-center">
        <Link to="/" className="mb-6">
          <img src="/logo.png" alt="Sehatak Online Logo" className="h-16 object-contain hover:opacity-90 transition-opacity" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </Link>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center">{t('share_title')}</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 text-center">{t('share_desc')}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12 text-start">
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-blue-900 text-lg mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              {t('share_msg_doctors')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span>{t('share_feature_d1')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Calendar className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span>{t('share_feature_d2')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Globe className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span>{t('share_feature_d3')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Users className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span>{t('share_feature_d4')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Search className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span>{t('share_feature_d5')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span>{t('share_feature_d6')}</span></li>
            </ul>
          </div>
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
            <h3 className="font-bold text-emerald-900 text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('share_msg_patients')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Search className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{t('share_feature_p1')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Calendar className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{t('share_feature_p2')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{t('share_feature_p3')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Clock className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{t('share_feature_p4')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Stethoscope className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{t('share_feature_p5')}</span></li>
            </ul>
          </div>
        </div>

        <p className="text-slate-800 font-bold mb-6 text-center">{t('share_call_to_action')}</p>
        
        <div className="flex flex-wrap justify-center gap-4 relative">
          {shareLinks.map((link, idx) => (
            <a 
              key={idx} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={\`group flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg \${link.color}\`}
            >
              {link.icon}
              <span className="hidden sm:inline">{link.name}</span>
            </a>
          ))}
          
          <button 
            onClick={handleCopyLink}
            className="group flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
          >
            <LinkIcon className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-600" />
            <span className="hidden sm:inline">{t('copy_link')}</span>
          </button>
        </div>

        {copied && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4">
            <span className="text-sm font-medium">{t('link_copied_success')}</span>
          </div>
        )}
      </div>`;

content = content.replace(oldJSXShareStr, newJSXShareStr);

fs.writeFileSync('src/pages/public/Home.tsx', content);
console.log("Patched Home.tsx advanced");
