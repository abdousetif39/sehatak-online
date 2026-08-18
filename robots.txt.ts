import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "text/plain");

  res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /doctor/
Disallow: /login

Sitemap: https://www.sehatek.online/sitemap.xml`);
}