import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { repairsOf, repairsTitle } from '@/lib/format';
import CategoryPage, { categoryMetadata } from '@/components/CategoryPage';

// „სარემონტო სამუშაოები“ — same page as a service, own list (admin tab „სარემონტო სამუშაოები“).
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const content = await getContent();
  const c = repairsOf(content).find((x) => x.id === id);
  if (!c) return { title: 'გვერდი ვერ მოიძებნა', robots: { index: false } };
  return categoryMetadata(c, content.settings, '/remonti');
}

export default async function RepairPage({ params }) {
  const { id } = await params;
  const content = await getContent();
  const list = repairsOf(content);
  const c = list.find((x) => x.id === id);
  if (!c) notFound();
  const first = list[0]?.id;
  return (
    <CategoryPage content={content} c={c} list={list} basePath="/remonti"
      listTitle={repairsTitle(content.settings)} listHref={first ? `/remonti/${first}` : '/'} otherTitle="სხვა სარემონტო სამუშაოები" />
  );
}
