import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAuthed } from '@/lib/auth';
import { getContent, isValidContent, saveContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!isAuthed(request)) return NextResponse.json({ ok: false, error: 'not logged in' }, { status: 401 });
  return NextResponse.json({ ok: true, data: await getContent() });
}

export async function PUT(request) {
  if (!isAuthed(request)) return NextResponse.json({ ok: false, error: 'not logged in' }, { status: 401 });
  const data = await request.json().catch(() => null);
  if (!isValidContent(data)) return NextResponse.json({ ok: false, error: 'არასწორი მონაცემები' }, { status: 400 });
  try {
    await saveContent(data);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN ? 'Vercel-ზე შენახვისთვის საჭიროა Blob Storage — იხ. README' : 'შენახვა ვერ მოხერხდა: ' + e.message },
      { status: 500 }
    );
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
