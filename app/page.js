import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBox from '@/components/SearchBox';
import ContactSection from '@/components/ContactSection';
import RevealInit from '@/components/RevealInit';
import { getContent } from '@/lib/content';
import { telHref, waHref } from '@/lib/format';

// Read content.json on every request, so admin changes show immediately.
export const dynamic = 'force-dynamic';

// How many services fit in the hero panel before it shows a "+N more" tile.
const HERO_MAX = 8;

export async function generateMetadata() {
  const { settings: s, categories } = await getContent();
  return {
    title: `${s.tagline} | ${s.brand}`,
    description: `${s.brand}: ${categories.map((c) => c.name).join(', ')}.`,
  };
}

export default async function Home() {
  const content = await getContent();
  const s = content.settings;
  const cats = content.categories;
  const link = (c) => `/services/${c.id}`;

  return (
    <>
      <Header content={content} />
      <RevealInit />
      <main>
        {/* ---------- HERO ---------- */}
        <section className="hero">
          <div className="hero-bg" aria-hidden="true">
            <div className="glow glow-1" />
            <div className="glow glow-2" />
            <div className="grid-lines" />
          </div>

          <div className="wrap hero-in">
            <div className="hero-copy">
              <span className="pill"><span className="live-dot" />{s.heroBadge}</span>
              <h1>{s.heroTitle}</h1>
              <p className="lead">{s.heroText}</p>

              <SearchBox categories={cats} />

              <div className="hero-btns">
                <a className="btn btn-primary btn-lg" href={telHref(s.phone)}>📞 {s.phone}</a>
                <a className="btn btn-glass btn-lg" href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
              </div>

              {s.heroPoints?.length ? (
                <ul className="checks">
                  {s.heroPoints.map((p) => <li key={p}>{p}</li>)}
                </ul>
              ) : null}
            </div>

            {/* real services + contact info */}
            <aside className="hero-panel">
              <div className="hp-head">
                <b>აირჩიე სერვისი</b>
                <a href="#services">ყველა →</a>
              </div>
              <div className="hp-grid">
                {(cats.length > HERO_MAX ? cats.slice(0, HERO_MAX - 1) : cats).map((c) => (
                  <Link key={c.id} href={link(c)} className="hp-item">
                    <span className="hp-icon">{c.icon}</span>
                    <span className="hp-name">{c.name}</span>
                  </Link>
                ))}
                {cats.length > HERO_MAX && (
                  <a href="#services" className="hp-item hp-more">
                    <span className="hp-icon">+{cats.length - HERO_MAX + 1}</span>
                    <span className="hp-name">სხვა სერვისი →</span>
                  </a>
                )}
              </div>
              <div className="hp-info">
                <div><span>🕘</span>{s.hours}</div>
                <div><span>📍</span>{s.area}</div>
              </div>
            </aside>
          </div>
        </section>

        {/* ---------- MARQUEE ---------- */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...cats, ...cats].map((c, i) => (
              <span key={i}><i>{c.icon}</i>{c.name}</span>
            ))}
          </div>
        </div>

        {/* ---------- SERVICES ---------- */}
        <section id="services" className="section">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="eyebrow">სერვისები</span>
              <h2>ყველა ხელობა ერთ ნომერზე</h2>
              <p>აირჩიე მიმართულება — ნახავ, რა სამუშაოებს მოიცავს.</p>
            </div>
            <div className="cards">
              {cats.map((c, i) => (
                <article key={c.id} className="card reveal" style={{ '--d': `${(i % 4) * 60}ms` }}>
                  <div className="card-top">
                    <span className="card-icon">{c.icon}</span>
                    <span className="card-num">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3><Link href={link(c)}>{c.name}</Link></h3>
                  <p>{c.short}</p>
                  <ul>{c.subs.slice(0, 4).map((sub, j) => <li key={j}>{sub.name}</li>)}</ul>
                  <span className="more">ყველა სამუშაო <span className="card-arrow">→</span></span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- WHY US (dark) — hidden when the admin list is empty ---------- */}
        {content.benefits?.length ? (
        <section className="section dark">
          <div className="dark-glow" aria-hidden="true" />
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="eyebrow">რატომ ჩვენ</span>
              <h2>ხელოსანი, რომელსაც ენდობი</h2>
            </div>
            <div className="benefits" style={{ '--n': content.benefits.length }}>
              {content.benefits.map((b, i) => (
                <div key={i} className="benefit reveal" style={{ '--d': `${i * 70}ms` }}>
                  <span className="b-num">0{i + 1}</span>
                  <span className="b-icon">{b.icon}</span>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        ) : null}

        {/* ---------- HOW IT WORKS ---------- */}
        <section id="how" className="section">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="eyebrow">პროცესი</span>
              <h2>ზარიდან დასრულებულ სამუშაომდე</h2>
            </div>
            <ol className="timeline" style={{ '--n': content.steps.length }}>
              {content.steps.map((x, i) => (
                <li key={i} className="reveal" style={{ '--d': `${i * 70}ms` }}>
                  <span className="t-num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{x.title}</h3>
                  <p>{x.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- GUIDE ---------- */}
        <section id="guide" className="section alt">
          <div className="wrap guide-wrap">
            <div className="sec-head left reveal">
              <span className="eyebrow">გზამკვლევი</span>
              <h2>არ იცი, ვინ გჭირდება?</h2>
              <p>მოძებნე შენი სიტუაცია. თუ აქ არ არის — უბრალოდ დაგვირეკე და ერთად გავარკვევთ.</p>
              <a className="btn btn-dark btn-lg" href={telHref(s.phone)}>📞 {s.phone}</a>
            </div>
            <div className="guide reveal">
              {content.guide.map((g, i) => {
                const c = cats.find((x) => x.id === g.category);
                return (
                  <a key={i} className="guide-row" href={c ? link(c) : '#contact'}>
                    <span className="g-icon">{c?.icon || '❔'}</span>
                    <span className="g-text">{g.situation}<b>{g.who}</b></span>
                    <span className="g-arrow">→</span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- CTA BAND ---------- */}
        <section className="cta-band">
          <div className="wrap">
            <div className="cta-box reveal">
              <div>
                <h2>გჭირდება ხელოსანი დღესვე?</h2>
                <p>დარეკე ან მოგვწერე — ფოტოს მიხედვით სწრაფად გეტყვით რა და როდის.</p>
              </div>
              <div className="cta-actions">
                <a className="btn btn-white btn-lg" href={telHref(s.phone)}>📞 {s.phone}</a>
                <a className="btn btn-outline-white btn-lg" href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- AREAS ---------- */}
        <section className="section">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="eyebrow">არეალი</span>
              <h2>ვმუშაობთ მთელ თბილისში</h2>
            </div>
            <div className="chips reveal">
              {content.areas.map((a) => <span key={a} className="chip">📍 {a}</span>)}
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section id="faq" className="section alt">
          <div className="wrap narrow">
            <div className="sec-head reveal">
              <span className="eyebrow">FAQ</span>
              <h2>ხშირად დასმული კითხვები</h2>
            </div>
            <div className="faq reveal">
              {content.faq.map((f, i) => (
                <details key={i}><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <ContactSection content={content} />
      </main>
      <Footer content={content} />
    </>
  );
}
