// Visitor counter stored in Upstash Redis (Vercel → Storage → Upstash Redis, free plan).
// No npm package: Upstash has a plain HTTPS API. Without the database nothing is counted
// and the admin tab „ვიზიტორები“ shows how to connect it.

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const KEEP_SECONDS = 60 * 60 * 24 * 400; // keep daily numbers ~13 months

export const statsEnabled = () => Boolean(URL_ && TOKEN);

// Run several Redis commands in one request; returns their results in order.
export async function redis(commands) {
  const r = await fetch(`${URL_.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });
  if (!r.ok) throw new Error('Redis ' + r.status);
  const out = await r.json();
  return out.map((x) => x.result);
}

// Day in Tbilisi time, e.g. 2026-11-03
export function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tbilisi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function lastDays(n) {
  const out = [];
  const now = Date.now();
  for (let i = n - 1; i >= 0; i--) out.push(dayKey(new Date(now - i * 86400000)));
  return [...new Set(out)];
}

export async function recordVisit({ path, visitor, source }) {
  const d = dayKey();
  const cmds = [
    ['INCR', `pv:${d}`],
    ['PFADD', `uv:${d}`, visitor],
    ['HINCRBY', `pages:${d}`, path, 1],
    ['EXPIRE', `pv:${d}`, KEEP_SECONDS],
    ['EXPIRE', `uv:${d}`, KEEP_SECONDS],
    ['EXPIRE', `pages:${d}`, KEEP_SECONDS],
  ];
  if (source) cmds.push(['HINCRBY', `src:${d}`, source, 1], ['EXPIRE', `src:${d}`, KEEP_SECONDS]);
  await redis(cmds);
}

const toObj = (arr) => {
  const o = {};
  for (let i = 0; arr && i < arr.length; i += 2) o[arr[i]] = Number(arr[i + 1]) || 0;
  return o;
};
const top = (objs, n = 10) => {
  const sum = {};
  for (const o of objs) for (const [k, v] of Object.entries(o)) sum[k] = (sum[k] || 0) + v;
  return Object.entries(sum).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, count]) => ({ name, count }));
};

export async function readStats(days = 30) {
  const ds = lastDays(days);
  const week = ds.slice(-7);
  const cmds = [
    ...ds.map((d) => ['GET', `pv:${d}`]),
    ...ds.map((d) => ['PFCOUNT', `uv:${d}`]),
    ...ds.map((d) => ['HGETALL', `pages:${d}`]),
    ...ds.map((d) => ['HGETALL', `src:${d}`]),
    ['PFCOUNT', ...week.map((d) => `uv:${d}`)],
    ['PFCOUNT', ...ds.map((d) => `uv:${d}`)],
  ];
  const r = await redis(cmds);
  const n = ds.length;
  const views = r.slice(0, n).map((x) => Number(x) || 0);
  const visitors = r.slice(n, 2 * n).map((x) => Number(x) || 0);
  const pages = r.slice(2 * n, 3 * n).map(toObj);
  const sources = r.slice(3 * n, 4 * n).map(toObj);
  const sum = (a) => a.reduce((s, x) => s + x, 0);
  return {
    daily: ds.map((d, i) => ({ day: d, views: views[i], visitors: visitors[i] })),
    today: { views: views[n - 1], visitors: visitors[n - 1] },
    week: { views: sum(views.slice(-7)), visitors: Number(r[4 * n]) || 0 },
    month: { views: sum(views), visitors: Number(r[4 * n + 1]) || 0 },
    topPages: top(pages),
    topSources: top(sources),
  };
}
