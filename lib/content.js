import { promises as fs } from 'fs';
import path from 'path';
import { unstable_cache, revalidateTag } from 'next/cache';

/*
  Where the site content lives — still no database:

  • On Vercel (Blob store connected): content is saved as a JSON file
    in Vercel Blob storage, so the admin panel works on the live site.
    Every save is a new minified file (content-<time>.json); the newest one is
    used and the 5 before it are kept as backups (old ones are deleted).

  • Locally / on a normal server: data/content.json on disk, like before.

  The first time on Vercel (nothing saved yet) data/content.json from the
  repo is used as the starting content.
*/

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'content.json');
const BACKUPS = path.join(DATA_DIR, 'backups');
const KEEP_BACKUPS = 20;      // local disk backups
const BLOB_KEEP_BACKUPS = 5;  // Vercel Blob: newest + 5 older versions

const BLOB_PREFIX = 'site-content/';
const CACHE_TAG = 'site-content';

/*
  How Blob access is detected:
  • New stores (2026+) connect through OIDC: Vercel adds BLOB_STORE_ID and the SDK
    signs in automatically — no token variable exists.
  • Older stores add BLOB_READ_WRITE_TOKEN (or <PREFIX>_READ_WRITE_TOKEN).
*/
function blobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  for (const [k, v] of Object.entries(process.env)) {
    if (k.endsWith('_READ_WRITE_TOKEN') && typeof v === 'string' && v.startsWith('vercel_blob_rw_')) return v;
  }
  return '';
}
export const hasBlob = () => !!(process.env.BLOB_STORE_ID || blobToken());
const useBlob = hasBlob;
const auth = () => (blobToken() ? { token: blobToken() } : {}); // empty → SDK uses OIDC

// Store access: private (default for new stores) or public. Override with BLOB_ACCESS.
let access = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';
const otherAccess = () => (access === 'private' ? 'public' : 'private');
const isAccessError = (e) => /access|private|public/i.test(String(e?.message || e));

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
    const res = await list({ prefix: BLOB_PREFIX, limit: 1000, cursor, ...auth() });
    all.push(...res.blobs);
    cursor = res.hasMore ? res.cursor : undefined;
  } while (cursor);
  // newest first (file names start with a fixed-width timestamp)
  return all.sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
}

async function readBlob(pathname) {
  const { get } = await import('@vercel/blob');
  let result;
  try {
    result = await get(pathname, { access, ...auth() });
  } catch (e) {
    if (!isAccessError(e)) throw e;
    access = otherAccess();
    result = await get(pathname, { access, ...auth() });
  }
  if (!result || result.statusCode !== 200) throw new Error('Blob read failed');
  return new Response(result.stream).json();
}

// Cached until the next save, so page views don't hit Blob every time.
const readBlobCached = unstable_cache(
  async () => {
    const versions = await listBlobVersions();
    if (!versions.length) return null;
    return readBlob(versions[0].pathname);
  },
  ['site-content-v2'],
  { tags: [CACHE_TAG] }
);

async function saveBlob(data) {
  const { put, del } = await import('@vercel/blob');
  const body = JSON.stringify(data); // minified (no indentation)
  const name = `${BLOB_PREFIX}content-${Date.now()}.json`;
  const opts = () => ({ access, contentType: 'application/json', addRandomSuffix: true, ...auth() });
  try {
    await put(name, body, opts());
  } catch (e) {
    if (!isAccessError(e)) throw e;
    access = otherAccess(); // store is the other kind — retry once
    await put(name, body, opts());
  }
  const versions = await listBlobVersions();
  const old = versions.slice(BLOB_KEEP_BACKUPS + 1);
  if (old.length) await del(old.map((b) => b.url), auth());
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
