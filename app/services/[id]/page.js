import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactSection from '@/components/ContactSection';
import OrderButton from '@/components/OrderButton';
import RevealInit from '@/components/RevealInit';
import { getContent } from '@/lib/content';
import { telHref, waHref } from '@/lib/format';

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
      <Header content={content} />
      <RevealInit />
      <main>
        <section className="hero svc-hero">
          <div className="hero-bg" aria-hidden="true">
            <div className="glow glow-1" />
            <div className="grid-lines" />
          </div>
          <div className="wrap">
            <div className="crumbs">
              <Link href="/">მთავარი</Link><span>/</span><Link href="/#services">სერვისები</Link><span>/</span><b>{c.name}</b>
            </div>
            <div className="svc-hero-in">
              <div className="svc-icon">{c.icon}</div>
              <div>
                {c.group ? <span className="pill">{c.group}</span> : null}
                <h1>{c.name}</h1>
                <p className="lead">{c.description || c.short}</p>
                <div className="hero-btns">
                  <a className="btn btn-primary btn-lg" href={telHref(s.phone)}>📞 დარეკე</a>
                  <a className="btn btn-glass btn-lg" href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="sec-head left reveal">
              <span className="eyebrow">{c.subs.length} სამუშაო</span>
              <h2>რას ვაკეთებთ</h2>
              <p>აირჩიე სამუშაო და დაგვიტოვე მოთხოვნა — დეტალებს ზარისას დავაზუსტებთ.</p>
            </div>
            <div className="jobs">
              {c.subs.map((sub, i) => (
                <div key={i} className="job reveal" style={{ '--d': `${(i % 2) * 60}ms` }}>
                  <span className="job-icon">{c.icon}</span>
                  <div className="job-text"><h3>{sub.name}</h3>{sub.text ? <p>{sub.text}</p> : null}</div>
                  <OrderButton value={`${c.name} — ${sub.name}`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section alt">
          <div className="wrap">
            <div className="sec-head left reveal"><span className="eyebrow">კიდევ</span><h2>სხვა სერვისები</h2></div>
            <div className="mini-cards">
              {content.categories.filter((x) => x.id !== c.id).map((x) => (
                <Link key={x.id} className="mini" href={`/services/${x.id}`}>
                  <span className="mini-icon">{x.icon}</span>
                  <b>{x.name}</b>
                  <span className="mini-arrow">→</span>
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
