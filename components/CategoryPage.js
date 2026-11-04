import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactSection from '@/components/ContactSection';
import OrderButton from '@/components/OrderButton';
import RevealInit from '@/components/RevealInit';
import { telHref, waHref, siteLink } from '@/lib/format';
import WaIcon from '@/components/WaIcon';
import { JsonLd, serviceJsonLd, serviceTitle, serviceDescription, serviceImage, keywords } from '@/lib/seo';

// One page for a category with its subcategories. Used by „სერვისები“ (/services/…)
// and by „სარემონტო სამუშაოები“ (/remonti/…); `list` is the menu the category belongs to.
export function categoryMetadata(c, settings, basePath) {
  const title = serviceTitle(c);
  const description = serviceDescription(c, settings);
  const path = `${basePath}/${c.id}`;
  const image = { url: serviceImage(c), width: 1200, height: 630, alt: `${c.name} თბილისში — ${settings.brand}` };
  return {
    title,
    description,
    keywords: keywords([`${c.name} თბილისში`, c.name, ...c.subs.map((x) => x.name), c.group, 'ხელოსანი თბილისში', settings.brand]),
    alternates: { canonical: path },
    openGraph: { type: 'website', locale: 'ka_GE', siteName: settings.brand, url: path, title: `${title} | ${settings.brand}`, description, images: [image] },
    twitter: { card: 'summary_large_image', title: `${title} | ${settings.brand}`, description, images: [image.url] },
  };
}

export default function CategoryPage({ content, c, list, basePath, listTitle, listHref, otherTitle }) {
  const s = content.settings;
  return (
    <>
      <JsonLd data={serviceJsonLd(c, content, basePath)} />
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
              <Link href="/">მთავარი</Link><span>/</span><Link href={listHref}>{listTitle}</Link><span>/</span><b>{c.name}</b>
            </div>
            <div className="svc-hero-in">
              <div className="svc-icon">{c.icon}</div>
              <div>
                {c.group ? <span className="pill">{c.group}</span> : null}
                <h1>{c.name}</h1>
                <p className="lead">{c.description || c.short}</p>
                <div className="hero-btns">
                  <a className="btn btn-primary btn-lg" href={telHref(s.phone)}>📞 დარეკე</a>
                  <a className="btn btn-glass btn-lg" href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer"><WaIcon /> WhatsApp</a>
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
                  <div className="job-text"><h3>{siteLink(sub.name)
                    ? <a className="site-link" href={siteLink(sub.name)} target="_blank" rel="noopener noreferrer">{sub.name} ↗</a>
                    : sub.name}</h3>{sub.text ? <p>{sub.text}</p> : null}</div>
                  <OrderButton value={`${c.name} — ${sub.name}`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section alt">
          <div className="wrap">
            <div className="sec-head left reveal"><span className="eyebrow">კიდევ</span><h2>{otherTitle}</h2></div>
            <div className="mini-cards">
              {list.filter((x) => x.id !== c.id).map((x) => (
                <Link key={x.id} className="mini" href={`${basePath}/${x.id}`}>
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
