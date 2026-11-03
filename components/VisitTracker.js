'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Sends one small "page viewed" signal per page (no cookies, no personal data).
// A random id in this browser's storage lets the admin count unique visitors.
export default function VisitTracker() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith('/admin')) return;
    let visitor = 'anon';
    try {
      visitor = localStorage.getItem('mv_id') || '';
      if (!visitor) {
        visitor = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
        localStorage.setItem('mv_id', visitor);
      }
    } catch {}
    const body = JSON.stringify({ path, visitor, ref: document.referrer || '' });
    try {
      if (navigator.sendBeacon) navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
      else fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } });
    } catch {}
  }, [path]);
  return null;
}
