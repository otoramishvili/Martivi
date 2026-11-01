import { NextResponse } from 'next/server';

// One address for Google: every visit to the old Vercel address (martivi-two.vercel.app)
// or to www.martivi.org is sent to https://martivi.org with a permanent (308) redirect.
// Preview deployments are left alone so they can still be checked before going live.
const SITE = new URL((process.env.NEXT_PUBLIC_SITE_URL || 'https://martivi.org').trim());
const OLD_HOSTS = ['martivi-two.vercel.app'];

export function middleware(req) {
  const host = (req.headers.get('host') || '').toLowerCase().split(':')[0];
  if (!host || host === SITE.hostname) return NextResponse.next();

  const isOldVercel =
    OLD_HOSTS.includes(host) || (host.endsWith('.vercel.app') && process.env.VERCEL_ENV === 'production');
  const isWww = host === 'www.' + SITE.hostname;

  if (isOldVercel || isWww) {
    const to = new URL(req.nextUrl.pathname + req.nextUrl.search, SITE.origin);
    return NextResponse.redirect(to, 308);
  }
  return NextResponse.next();
}

export const config = {
  // Not for the admin API or Next's own files.
  matcher: ['/((?!api/|_next/).*)'],
};
