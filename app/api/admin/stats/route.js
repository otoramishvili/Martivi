import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { readStats, statsEnabled } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!isAuthed(request)) return NextResponse.json({ ok: false, error: 'not logged in' }, { status: 401 });
  if (!statsEnabled()) return NextResponse.json({ ok: true, enabled: false });
  try {
    return NextResponse.json({ ok: true, enabled: true, stats: await readStats(30) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'სტატისტიკის წაკითხვა ვერ მოხერხდა: ' + e.message }, { status: 500 });
  }
}
