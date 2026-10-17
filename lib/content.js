import { promises as fs } from 'fs';
import path from 'path';
import { unstable_cache, revalidateTag } from 'next/cache';

/*
  Where the site content lives — still no database:

  • On Vercel (BLOB_READ_WRITE_TOKEN is set): content is saved as a JSON file
    in Vercel Blob storage, so the admin panel works on the live site.
    Every save is a new file (content-<time>.json); the newest one is used and
    the last 20 are kept as backups.

  • Locally / on a normal server: data/content.json on disk, like before.

  The first time on Vercel (nothing saved yet) data/content.json from the
  repo is used as the starting content.
*/

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'content.json');
const BACKUPS = path.join(DATA_DIR, 'backups');
const KEEP_BACKUPS = 20;

const BLOB_PREFIX = 'site-content/';
const CACHE_TAG = 'site-content';
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export function isValidContent(d) {
  return d && typeof d === 'object' && d.settings && Array.isArray(d.categories);
}

/* ---------- local file ---------- */
async function readLocal() {
  return JSON.parse(await fs.readFile(FILE, 'utf8'));
}

async function saveLocal(data) {
  await fs.mkdir(BACKUPS, { recursive: true });
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.copyFile(FILE, path.join(BACKUPS, `content-${stamp}.json`));
    const old = (await fs.readdir(BACKUPS)).filter((f) => f.startsWith('content-')).sort();
    while (old.length > KEEP_BACKUPS) await fs.unlink(path.join(BACKUPS, old.shift()));
  } catch {
    // first save or backup folder not writable — continue anyway
  }
  const tmp = FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, FILE);
}

/* ---------- Vercel Blob ---------- */
async function listBlobVersions() {
  const { list } = await import('@vercel/blob');
  const all = [];
  let cursor;
  do {
    const res = await list({ prefix: BLOB_PREFIX, limit: 1000, cursor });
    all.push(...res.blobs);
    cursor = res.hasMore ? res.cursor : undefined;
  } while (cursor);
  // newest first (file names start with a fixed-width timestamp)
  return all.sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
}

// Cached until the next save, so page views don't hit Blob every time.
const readBlobCached = unstable_cache(
  async () => {
    const versions = await listBlobVersions();
    if (!versions.length) return null;
    const res = await fetch(versions[0].url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Blob read failed: ${res.status}`);
    return res.json();
  },
  ['site-content-v1'],
  { tags: [CACHE_TAG] }
);

async function saveBlob(data) {
  const { put, del } = await import('@vercel/blob');
  await put(`${BLOB_PREFIX}content-${Date.now()}.json`, JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: true,
  });
  const versions = await listBlobVersions();
  const old = versions.slice(KEEP_BACKUPS + 1);
  if (old.length) await del(old.map((b) => b.url));
  revalidateTag(CACHE_TAG);
}

/* ---------- public API ---------- */
export async function getContent() {
  if (useBlob()) {
    const saved = await readBlobCached();
    if (isValidContent(saved)) return saved;
  }
  return readLocal();
}

export async function saveContent(data) {
  if (useBlob()) return saveBlob(data);
  return saveLocal(data);
}
