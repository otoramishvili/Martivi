import { NextResponse } from 'next/server';
import { COOKIE, checkPassword, sessionToken } from '@/lib/auth';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  await new Promise((r) => setTimeout(r, 300)); // slow down guessing

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: 'ADMIN_PASSWORD არ არის მითითებული (.env.local)' }, { status: 500 });
  }
  if (!checkPassword(body.password || '')) {
    return NextResponse.json({ ok: false, error: 'არასწორი პაროლი' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
