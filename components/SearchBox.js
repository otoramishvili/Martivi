'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function SearchBox({ categories }) {
  const [q, setQ] = useState('');

  const index = useMemo(() => {
    const out = [];
    for (const c of categories) {
      const href = `/services/${c.id}`;
      out.push({ key: c.id, label: c.name, sub: c.short, href, icon: c.icon });
      c.subs.forEach((s, i) =>
        out.push({ key: `${c.id}-${i}`, label: s.name, sub: c.name, href, icon: c.icon })
      );
    }
    return out;
  }, [categories]);

  // examples come from the current services, so they never mention removed ones
  const placeholder = useMemo(() => {
    const ex = categories.map((c) => c.subs[0]?.name || c.name).filter(Boolean).slice(0, 3);
    return ex.length ? `რა გჭირდება? მაგ: ${ex.join(', ').toLowerCase()}…` : 'რა გჭირდება?';
  }, [categories]);

  const term = q.trim().toLowerCase();
  const hits = term.length < 2 ? [] : index.filter((i) => `${i.label} ${i.sub}`.toLowerCase().includes(term)).slice(0, 7);

  return (
    <div className="search">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <div className={'search-results' + (term.length >= 2 ? ' open' : '')}>
        {hits.map((h) => (
          <Link key={h.key} href={h.href}>
            <span>{h.icon}</span>
            <div><b>{h.label}</b><small>{h.sub}</small></div>
          </Link>
        ))}
        {term.length >= 2 && hits.length === 0 && (
          <div className="none">ვერ მოიძებნა — <a href="#contact">მოგვწერე</a> და გეტყვით</div>
        )}
      </div>
    </div>
  );
}
