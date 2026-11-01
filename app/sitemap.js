import { getContent } from '@/lib/content';
import { siteUrl } from '@/lib/seo';

// /sitemap.xml — the list of pages Google should index. Built from the current services,
// so a service added in the admin appears here automatically.
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const { categories } = await getContent();
  const url = siteUrl();
  return [
    { url: `${url}/`, changeFrequency: 'weekly', priority: 1 },
    ...categories.map((c) => ({
      url: `${url}/services/${c.id}`,
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
  ];
}
