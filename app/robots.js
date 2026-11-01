import { siteUrl } from '@/lib/seo';

// /robots.txt — lets search engines crawl the site but not the admin panel or API.
// Preview deployments on Vercel are blocked so they never compete with the real site.
export const dynamic = 'force-dynamic';

export default function robots() {
  const url = siteUrl();
  const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';
  if (isPreview) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
