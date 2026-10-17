'use client';
import Link from 'next/link';
import { useState } from 'react';
import { telHref, waHref } from '@/lib/format';

const LINKS = [
  ['/#services', 'სერვისები'],
  ['/#guide', 'რა მჭირდება?'],
  ['/#how', 'როგორ ვმუშაობთ'],
  ['/#reviews', 'შეფასებები'],
  ['/#faq', 'FAQ'],
  ['#contact', 'კონტაქტი'],
];

export default function Header({ settings: s }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span>{s.area}</span>
          <span className="dot">·</span>
          <span>{s.hours}</span>
          <a className="topbar-phone" href={telHref(s.phone)}>{s.phone}</a>
        </div>
      </div>
      <header className="header">
        <div className="wrap header-in">
          <Link href="/" className="logo">
            <span className="logo-mark">{(s.brand || 'ო').slice(0, 1)}</span>
            <span><b>{s.brand}</b><small>{s.tagline}</small></span>
          </Link>
          <nav className={'nav' + (open ? ' open' : '')}>
            {LINKS.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
            ))}
          </nav>
          <div className="header-cta">
            <a className="btn btn-ghost" href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a className="btn btn-primary" href={telHref(s.phone)}>დარეკე</a>
            <button className="burger" aria-label="მენიუ" onClick={() => setOpen(!open)}>☰</button>
          </div>
        </div>
      </header>
    </>
  );
}
