import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBox from '@/components/SearchBox';
import ContactSection from '@/components/ContactSection';
import { getContent } from '@/lib/content';
import { telHref } from '@/lib/format';

// Read content.json on every request, so admin changes show immediately.
export const dynamic = 'force-dynamic';

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
  const link = (c) => `/services/${c.id}`;

  return (
    <>
      <Header settings={s} />
      <main>
        <section className="hero">
          <div className="wrap hero-in">
            <div>
              <span className="badge">{s.heroBadge}</span>
              <h1>{s.heroTitle}</h1>
              <p className="lead">{s.heroText}</p>
              <ul className="checks">
                {(s.heroPoints || []).map((p) => <li key={p}>{p}</li>)}
              </ul>
              <SearchBox categories={content.categories} />
              <div className="hero-btns">
                <a className="btn btn-primary btn-lg" href={telHref(s.phone)}>📞 დარეკე ახლავე</a>
                <a className="btn btn-ghost btn-lg" href="#contact">ფასის გაგება</a>
              </div>
            </div>
            <div className="hero-card">
              <div className="hero-card-title">პოპულარული სერვისები</div>
              <div className="popular">
                {content.categories.slice(0, 6).map((c) => (
                  <Link key={c.id} href={link(c)}><span>{c.icon}</span>{c.name}</Link>
                ))}
              </div>
              <div className="stats">
                {(s.stats || []).map((x, i) => (
                  <div key={i}><b>{x.value}</b><span>{x.label}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="section">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">სერვისები</span>
              <h2>ყველა ხელობა ერთ ნომერზე</h2>
              <p>აირჩიე მიმართულება — ნახავ, რა სამუშაოებს მოიცავს.</p>
            </div>
            <div className="cards">
              {content.categories.map((c) => (
                <article key={c.id} className="card">
                  <div className="card-top"><span className="card-icon">{c.icon}</span></div>
                  <h4><Link href={link(c)}>{c.name}</Link></h4>
                  <p>{c.short}</p>
                  <ul>{c.subs.slice(0, 4).map((sub, i) => <li key={i}>{sub.name}</li>)}</ul>
                  <div className="card-foot"><Link className="more" href={link(c)}>ყველა სამუშაო →</Link></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section alt">
          <div className="wrap">
            <div className="sec-head"><span className="eyebrow">რატომ ჩვენ</span><h2>ხელოსანი, რომელსაც ენდობი</h2></div>
            <div className="benefits">
              {content.benefits.map((b, i) => (
                <div key={i} className="benefit"><span>{b.icon}</span><h4>{b.title}</h4><p>{b.text}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section id="guide" className="section">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">გზამკვლევი</span>
              <h2>არ იცი, ვინ გჭირდება?</h2>
              <p>მოძებნე შენი სიტუაცია. თუ აქ არ არის — უბრალოდ დაგვირეკე.</p>
            </div>
            <div className="guide">
              {content.guide.map((g, i) => {
                const c = content.categories.find((x) => x.id === g.category);
                return (
                  <a key={i} className="guide-row" href={c ? link(c) : '#contact'}>
                    <span>{g.situation}</span><b>{g.who} →</b>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how" className="section alt">
          <div className="wrap">
            <div className="sec-head"><span className="eyebrow">პროცესი</span><h2>ზარიდან დასრულებულ სამუშაომდე</h2></div>
            <ol className="steps">
              {content.steps.map((x, i) => <li key={i}><h4>{x.title}</h4><p>{x.text}</p></li>)}
            </ol>
          </div>
        </section>

        <section id="reviews" className="section">
          <div className="wrap">
            <div className="sec-head"><span className="eyebrow">შეფასებები</span><h2>რას ამბობენ მომხმარებლები</h2></div>
            <div className="reviews">
              {content.reviews.map((r, i) => (
                <figure key={i} className="review">
                  <div className="stars">{'★'.repeat(Math.max(1, Math.min(5, Number(r.rating) || 5)))}</div>
                  <blockquote>{r.text}</blockquote>
                  <figcaption>{r.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="section alt">
          <div className="wrap">
            <div className="sec-head"><span className="eyebrow">არეალი</span><h2>ვმუშაობთ მთელ თბილისში</h2></div>
            <div className="chips">{content.areas.map((a) => <span key={a} className="chip">{a}</span>)}</div>
          </div>
        </section>

        <section id="faq" className="section">
          <div className="wrap narrow">
            <div className="sec-head"><span className="eyebrow">FAQ</span><h2>ხშირად დასმული კითხვები</h2></div>
            <div className="faq">
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
