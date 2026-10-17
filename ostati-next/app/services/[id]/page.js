import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactSection from '@/components/ContactSection';
import OrderButton from '@/components/OrderButton';
import { getContent } from '@/lib/content';
import { telHref } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { settings, categories } = await getContent();
  const c = categories.find((x) => x.id === id);
  if (!c) return { title: settings.brand };
  return { title: `${c.name} თბილისში | ${settings.brand}`, description: c.description || c.short };
}

export default async function ServicePage({ params }) {
  const { id } = await params;
  const content = await getContent();
  const c = content.categories.find((x) => x.id === id);
  if (!c) notFound();
  const s = content.settings;

  return (
    <>
      <Header settings={s} />
      <main>
        <section className="svc-hero">
          <div className="wrap">
            <div className="crumbs">
              <Link href="/">მთავარი</Link> / <Link href="/#services">სერვისები</Link> / <span>{c.name}</span>
            </div>
            <div className="svc-hero-in">
              <div className="svc-icon">{c.icon}</div>
              <div>
                <span className="eyebrow">{c.group}</span>
                <h1>{c.name}</h1>
                <p className="lead">{c.description || c.short}</p>
                <div className="hero-btns">
                  <a className="btn btn-primary btn-lg" href={telHref(s.phone)}>📞 დარეკე</a>
                  <a className="btn btn-ghost btn-lg" href="#contact">შეკვეთა</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="sec-head left">
              <h2>რას ვაკეთებთ</h2>
              <p>აირჩიე სამუშაო და დაგვიტოვე მოთხოვნა — დეტალებს ზარისას დავაზუსტებთ.</p>
            </div>
            <div className="price-list">
              {c.subs.map((sub, i) => (
                <div key={i} className="price-row">
                  <div><h4>{sub.name}</h4><p>{sub.text}</p></div>
                  <div className="price-side">
                    <OrderButton value={`${c.name} — ${sub.name}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section alt">
          <div className="wrap">
            <div className="sec-head left"><h2>სხვა სერვისები</h2></div>
            <div className="cards small">
              {content.categories.filter((x) => x.id !== c.id).map((x) => (
                <Link key={x.id} className="card mini" href={`/services/${x.id}`}>
                  <span className="card-icon">{x.icon}</span>
                  <b>{x.name}</b>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ContactSection content={content} eyebrow="შეკვეთა" />
      </main>
      <Footer content={content} />
    </>
  );
}
