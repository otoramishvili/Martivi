import { NextResponse } from 'next/server';

// Once the own domain is set (NEXT_PUBLIC_SITE_URL in Vercel), visitors and Google that land on
// the old *.vercel.app address are sent to the real domain with a permanent redirect,
// so the site is indexed under one address only. Does nothing until that variable is set.
export function middleware(req) {
  const target = process.env.NEXT_PUBLIC_SITE_URL;
  if (!target || process.env.VERCEL_ENV !== 'production') return NextResponse.next();
  const host = req.headers.get('host') || '';
  let want;
  try {
    want = new URL(target);
  } catch {
    return NextResponse.next();
  }
  if (host.endsWith('.vercel.app') && host !== want.host) {
    const to = new URL(req.nextUrl.pathname + req.nextUrl.search, want);
    return NextResponse.redirect(to, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/).*)'],
};
