import { NextResponse } from 'next/server';
import { recordVisit, statsEnabled } from '@/lib/stats';

// Counts one page view (sent by components/VisitTracker.js). Bots and the admin are not counted.
export const dynamic = 'force-dynamic';

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|lighthouse|headless|curl|wget|python|monitor/i;

export async function POST(request) {
  if (!statsEnabled()) return new NextResponse(null, { status: 204 });
  try {
    const ua = request.headers.get('user-agent') || '';
    if (!ua || BOT.test(ua)) return new NextResponse(null, { status: 204 });
    const body = await request.json().catch(() => ({}));
    let path = String(body.path || '/').split('?')[0].split('#')[0].slice(0, 120) || '/';
    if (path.startsWith('/admin') || path.startsWith('/api')) return new NextResponse(null, { status: 204 });
    const visitor = String(body.visitor || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'anon';
    let source = '';
    try {
      const host = new URL(String(body.ref || '')).hostname.replace(/^www\./, '');
      const own = (request.headers.get('host') || '').replace(/^www\./, '').split(':')[0];
      if (host && host !== own) source = host.replace(/^(m|l|lm)\.facebook\.com$/, 'facebook.com').slice(0, 60);
    } catch {}
    await recordVisit({ path, visitor, source: source || 'პირდაპირ / უცნობი' });
  } catch {
    // counting must never break the site
  }
  return new NextResponse(null, { status: 204 });
}
