import { promises as fs } from 'fs';
import path from 'path';

// All site content lives in one JSON file — no database.
const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'content.json');
const BACKUPS = path.join(DATA_DIR, 'backups');
const KEEP_BACKUPS = 20;

export async function getContent() {
  const raw = await fs.readFile(FILE, 'utf8');
  return JSON.parse(raw);
}

export function isValidContent(d) {
  return d && typeof d === 'object' && d.settings && Array.isArray(d.categories);
}

export async function saveContent(data) {
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
