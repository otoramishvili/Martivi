import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import CategoryPage, { categoryMetadata } from '@/components/CategoryPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { settings, categories } = await getContent();
  const c = categories.find((x) => x.id === id);
  if (!c) return { title: 'გვერდი ვერ მოიძებნა', robots: { index: false } };
  return categoryMetadata(c, settings, '/services');
}

export default async function ServicePage({ params }) {
  const { id } = await params;
  const content = await getContent();
  const c = content.categories.find((x) => x.id === id);
  if (!c) notFound();
  return (
    <CategoryPage content={content} c={c} list={content.categories} basePath="/services"
      listTitle="სერვისები" listHref="/#services" otherTitle="სხვა სერვისები" />
  );
}
