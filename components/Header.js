'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { telHref, waHref, repairsOf, repairsTitle } from '@/lib/format';
import SocialLinks from '@/components/SocialLinks';

const LINKS = [
  ['/#how', 'როგორ ვმუშაობთ'],
  ['/#guide', 'რა მჭირდება?'],
  ['/#faq', 'FAQ'],
  ['/#contact', 'კონტაქტი'],
];

const pad = (n) => String(n).padStart(2, '0');

function Logo() {
  return (
    <span className="logo-badge">
      <img
        className="logo-img"
        src="/logo-full.webp"
        srcSet="/logo-full.webp 720w, /logo-full@1.5x.webp 1080w"
        sizes="140px"
        alt="Martivi — ყველა საქმე ერთ სივრცეში"
        width="720"
        height="420"
      />
    </span>
  );
}

/* ---- small inline icons ---- */
const I = {
  phone: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>,
  wa: <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z"/></svg>,
  home: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>,
  grid: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg>,
  menu: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>,
  close: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>,
  chev: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
};

/* "open now" — computed from the real hours text, in Tbilisi time */
function useOpenNow(hours) {
  const [state, setState] = useState(null);
  useEffect(() => {
    const m = String(hours || '').match(/(\d{1,2})[:.](\d{2})\s*[–—-]\s*(\d{1,2})[:.](\d{2})/);
    if (!m) return;
    const calc = () => {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
      const [h, mi] = parts.split(':').map(Number);
      const now = h * 60 + mi, from = +m[1] * 60 + +m[2], to = +m[3] * 60 + +m[4];
      setState(to > from ? now >= from && now < to : now >= from || now < to);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [hours]);
  return state; // null = unknown, true/false = open/closed
}

export default function Header({ content }) {
  const s = content.settings;
  const cats = content.categories;
  const repairs = repairsOf(content);
  const rTitle = repairsTitle(s);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false); // false | 'services' | 'repairs'
  const [menu, setMenu] = useState(false);
  const open = useOpenNow(s.hours);
  const navRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onKey = (e) => { if (e.key === 'Escape') { setMega(false); setMenu(false); } };
    const onClick = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setMega(false); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; }, [menu]);

  // If the navbar links don't fit next to the logo and buttons (depends on screen width and font),
  // hide them and show the ☰ menu button instead of letting the navbar overflow.
  const inRef = useRef(null);
  const [fit, setFit] = useState('full'); // full | tight (phone button = icon only) | compact (links in ☰ menu)
  const pillFull = useRef(0);
  useEffect(() => {
    const box = inRef.current;
    if (!box) return;
    const check = () => {
      const nav = box.querySelector('.hdr-nav');
      const logo = box.querySelector('.logo');
      const right = box.querySelector('.hdr-right');
      const pill = box.querySelector('.phone-pill');
      if (!nav || !logo || !right || !pill) return;
      if (!box.closest('.hdr').classList.contains('fit-tight') && pill.offsetWidth) pillFull.current = pill.offsetWidth;
      const btn = right.querySelector('.menu-btn');
      const btnW = btn && getComputedStyle(btn).display !== 'none' ? btn.offsetWidth + 10 : 0;
      const cs = getComputedStyle(box);
      const gap = parseFloat(cs.columnGap) || 0;
      const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const rightFull = right.offsetWidth - btnW - pill.offsetWidth + (pillFull.current || pill.offsetWidth);
      const base = logo.offsetWidth + nav.scrollWidth + gap * 2 + pad + 24;
      const avail = box.clientWidth;
      if (!nav.scrollWidth) return setFit('full'); // small screens: links already in the menu (CSS)
      if (base + rightFull <= avail) return setFit('full');
      if (base + rightFull - (pillFull.current || pill.offsetWidth) + 48 <= avail) return setFit('tight');
      setFit('compact');
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(box);
    document.fonts?.ready?.then(check);
    window.addEventListener('resize', check);
    return () => { ro.disconnect(); window.removeEventListener('resize', check); };
  }, []);

  const hoverOpen = (key) => { clearTimeout(closeTimer.current); setMega(key); };
  const hoverClose = () => { closeTimer.current = setTimeout(() => setMega(false), 160); };
  const phoneShort = String(s.phone || '').replace(/^\+995\s*/, '');

  return (
    <>
      <header className={'hdr' + (scrolled ? ' is-solid' : '') + (fit === 'tight' ? ' fit-tight' : '') + (fit === 'compact' ? ' fit-tight nav-compact' : '')}>
        <div className="wrap hdr-in" ref={inRef}>
          <Link href="/" className="logo" aria-label={s.brand}>
            <Logo />
          </Link>

          <nav className="hdr-nav" aria-label="მთავარი მენიუ" ref={navRef}>
            <div className={'mega-wrap' + (mega === 'services' ? ' open' : '')} onMouseEnter={() => hoverOpen('services')} onMouseLeave={hoverClose}>
              <button type="button" className="hdr-link mega-btn" aria-expanded={mega === 'services'} onClick={() => setMega((v) => (v === 'services' ? false : 'services'))}>
                სერვისები <span className="chev">{I.chev}</span>
              </button>

              <div className="mega" role="menu">
                <div className="mega-grid">
                  {cats.map((c, i) => (
                    <Link key={c.id} href={`/services/${c.id}`} className="mega-item" onClick={() => setMega(false)}>
                      <span className="mega-icon">{c.icon}</span>
                      <span className="mega-text"><b>{c.name}</b><small>{c.short}</small></span>
                      <span className="mega-num">{pad(i + 1)}</span>
                    </Link>
                  ))}
                </div>
                <div className="mega-side">
                  <span className="mega-side-label">არ იცი, რომელი გჭირდება?</span>
                  <b>დაგვირეკე და ერთად გავარკვევთ</b>
                  <a className="btn btn-primary" href={telHref(s.phone)}>{I.phone} {s.phone}</a>
                  <a className="btn btn-wa" href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer">{I.wa} WhatsApp</a>
                  <span className="mega-hours">🕘 {s.hours}</span>
                </div>
              </div>
            </div>

            {/* ---- სარემონტო სამუშაოები (admin tab „სარემონტო სამუშაოები“) ---- */}
            {repairs.length ? (
            <div className={'mega-wrap' + (mega === 'repairs' ? ' open' : '')} onMouseEnter={() => hoverOpen('repairs')} onMouseLeave={hoverClose}>
              <button type="button" className="hdr-link mega-btn" aria-expanded={mega === 'repairs'} onClick={() => setMega((v) => (v === 'repairs' ? false : 'repairs'))}>
                {rTitle} <span className="chev">{I.chev}</span>
              </button>

              <div className="mega" role="menu">
                <div className="mega-grid">
                  {repairs.map((c, i) => (
                    <Link key={c.id} href={`/remonti/${c.id}`} className="mega-item" onClick={() => setMega(false)}>
                      <span className="mega-icon">{c.icon}</span>
                      <span className="mega-text"><b>{c.name}</b><small>{c.short}</small></span>
                      <span className="mega-num">{pad(i + 1)}</span>
                    </Link>
                  ))}
                </div>
                <div className="mega-side">
                  <span className="mega-side-label">არ იცი, რომელი გჭირდება?</span>
                  <b>დაგვირეკე და ერთად გავარკვევთ</b>
                  <a className="btn btn-primary" href={telHref(s.phone)}>{I.phone} {s.phone}</a>
                  <a className="btn btn-wa" href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer">{I.wa} WhatsApp</a>
                  <span className="mega-hours">🕘 {s.hours}</span>
                </div>
              </div>
            </div>
            ) : null}

            {LINKS.map(([href, label]) => <a key={href} href={href} className="hdr-link">{label}</a>)}
          </nav>

          <div className="hdr-right">
            <a className={'phone-pill' + (open ? ' is-open' : '')} href={telHref(s.phone)} title={open === null ? s.hours : open ? `ახლა ღიაა · ${s.hours}` : `ახლა დაკეტილია · ${s.hours}`}>
              <span className="pp-icon">{I.phone}</span>
              <span className="pp-num">{phoneShort}</span>
              <span className="pp-arrow">→</span>
            </a>
            <a className="wa-round" href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">{I.wa}</a>
            <button type="button" className="menu-btn" aria-label="მენიუ" onClick={() => setMenu(true)}>{I.menu}</button>
          </div>
        </div>
      </header>

      {/* ---- fixed social links (left edge, all pages) ---- */}
      <SocialLinks settings={s} className="social-rail" />

      {/* ---- full-screen menu ---- */}
      <div className={'overlay' + (menu ? ' open' : '')} aria-hidden={!menu}>
        <div className="ov-top wrap">
          <Link href="/" className="logo" aria-label={s.brand} onClick={() => setMenu(false)}>
            <Logo />
          </Link>
          <button type="button" className="ov-close" aria-label="დახურვა" onClick={() => setMenu(false)}>{I.close}</button>
        </div>
        <div className="ov-body wrap">
          <ol className="ov-links">
            {[['/#services', 'სერვისები'], ...(repairs.length ? [[`/remonti/${repairs[0].id}`, rTitle]] : []), ...LINKS].map(([href, label], i) => (
              <li key={href} style={{ '--i': i }}>
                <a href={href} onClick={() => setMenu(false)}><span>{pad(i + 1)}</span>{label}</a>
              </li>
            ))}
          </ol>
          <div className="ov-services">
            {cats.map((c) => (
              <Link key={c.id} href={`/services/${c.id}`} onClick={() => setMenu(false)}><span>{c.icon}</span>{c.name}</Link>
            ))}
          </div>
          {repairs.length ? (
            <div className="ov-extra">
              <span className="ov-extra-title">{rTitle}</span>
              <div className="ov-services">
                {repairs.map((c) => (
                  <Link key={c.id} href={`/remonti/${c.id}`} onClick={() => setMenu(false)}><span>{c.icon}</span>{c.name}</Link>
                ))}
              </div>
            </div>
          ) : null}
          <div className="ov-cta">
            <a className="btn btn-primary btn-lg" href={telHref(s.phone)}>{I.phone} {s.phone}</a>
            <a className="btn btn-wa btn-lg" href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer">{I.wa} WhatsApp</a>
          </div>
          <SocialLinks settings={s} className="social-menu" />
          <div className="ov-meta"><span>🕘 {s.hours}</span><a href={`mailto:${s.email}`}>✉️ {s.email}</a></div>
        </div>
      </div>

      {/* ---- mobile bottom bar ---- */}
      <nav className="bottom-nav" aria-label="სწრაფი ნავიგაცია">
        <Link href="/" className="bn-item">{I.home}<span>მთავარი</span></Link>
        <a href="/#services" className="bn-item">{I.grid}<span>სერვისები</span></a>
        <a href={telHref(s.phone)} className="bn-call" aria-label="დარეკვა">{I.phone}</a>
        <a href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="bn-item bn-wa">{I.wa}<span>WhatsApp</span></a>
        <button type="button" className="bn-item" onClick={() => setMenu(true)}>{I.menu}<span>მენიუ</span></button>
      </nav>
    </>
  );
}
