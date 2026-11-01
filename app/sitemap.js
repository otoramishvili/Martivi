import { getContent } from '@/lib/content';
import { siteUrl, serviceImage, LOGO, SHARE_IMAGE } from '@/lib/seo';

// /sitemap.xml — every page Google should index, with its pictures (for Google Images).
// Built from the current services, so a service added in the admin appears here automatically.
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const { categories } = await getContent();
  const url = siteUrl();
  return [
    {
      url: `${url}/`,
      changeFrequency: 'weekly',
      priority: 1,
      images: [`${url}${SHARE_IMAGE}`, `${url}${LOGO.path}`],
    },
    ...categories.map((c) => ({
      url: `${url}/services/${c.id}`,
      changeFrequency: 'monthly',
      priority: 0.8,
      images: [`${url}${serviceImage(c)}`],
    })),
  ];
}
