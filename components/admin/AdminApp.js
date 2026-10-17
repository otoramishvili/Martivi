'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import './admin.css';

const TABS = [
  ['cats', '📂 კატეგორიები'],
  ['settings', '📝 საიტის ტექსტები'],
  ['guide', '🧭 გზამკვლევი'],
  ['benefits', '⭐ უპირატესობები'],
  ['steps', '🔢 პროცესი'],
  ['faq', '❓ FAQ'],
  ['areas', '📍 უბნები'],
];

const SETTINGS = [
  ['brand', 'ბრენდის სახელი'],
  ['tagline', 'ქვესათაური (ლოგოს ქვეშ)'],
  ['phone', 'ტელეფონი'],
  ['whatsapp', 'WhatsApp ნომერი (მხოლოდ ციფრები, 995…)'],
  ['email', 'ელფოსტა'],
  ['hours', 'სამუშაო საათები'],
  ['area', 'არეალი'],
  ['heroBadge', 'მთავარი — პატარა წარწერა'],
  ['heroTitle', 'მთავარი — სათაური', 'area'],
  ['heroText', 'მთავარი — ტექსტი', 'area'],
  ['formTitle', 'ფორმის სათაური'],
  ['formText', 'ფორმის ტექსტი', 'area'],
];

const LISTS = {
  faq: { title: 'ხშირად დასმული კითხვები', blank: { q: 'ახალი კითხვა?', a: '' },
    fields: [{ k: 'q', l: 'კითხვა' }, { k: 'a', l: 'პასუხი', t: 'area' }] },
  benefits: { title: 'რატომ ჩვენ — უპირატესობები', blank: { icon: '✅', title: '', text: '' },
    fields: [{ k: 'icon', l: 'ემოჯი', w: 'xs' }, { k: 'title', l: 'სათაური' }, { k: 'text', l: 'ტექსტი', t: 'area' }] },
  steps: { title: 'როგორ ვმუშაობთ — ნაბიჯები', blank: { title: '', text: '' },
    fields: [{ k: 'title', l: 'სათაური' }, { k: 'text', l: 'ტექსტი', t: 'area' }] },
  guide: { title: 'გზამკვლევი: „ვინ მჭირდება?“', blank: { situation: '', who: '', category: '' },
    fields: [{ k: 'situation', l: 'სიტუაცია' }, { k: 'who', l: 'ვინ გჭირდება' }, { k: 'category', l: 'ბმული კატეგორიაზე', t: 'cat' }] },
};

// Georgian -> latin, for category URLs
const MAP = { 'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', 'ე': 'e', 'ვ': 'v', 'ზ': 'z', 'თ': 't', 'ი': 'i', 'კ': 'k', 'ლ': 'l', 'მ': 'm', 'ნ': 'n', 'ო': 'o', 'პ': 'p', 'ჟ': 'zh', 'რ': 'r', 'ს': 's', 'ტ': 't', 'უ': 'u', 'ფ': 'p', 'ქ': 'q', 'ღ': 'gh', 'ყ': 'y', 'შ': 'sh', 'ჩ': 'ch', 'ც': 'ts', 'ძ': 'dz', 'წ': 'ts', 'ჭ': 'ch', 'ხ': 'kh', 'ჯ': 'j', 'ჰ': 'h' };
function toSlug(s) {
  return String(s).toLowerCase().split('').map((c) => MAP[c] ?? c).join('')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function uniqueSlug(name, categories) {
  const base = toSlug(name) || 'category';
  let out = base, n = 2;
  while (categories.some((c) => c.id === out)) out = `${base}-${n++}`;
  return out;
}
function move(arr, i, d) {
  const [x] = arr.splice(i, 1);
  arr.splice(i + d, 0, x);
}

export default function AdminApp() {
  const [status, setStatus] = useState('loading'); // loading | login | ready
  const [data, setData] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState('cats');
  const [sel, setSel] = useState(0);
  const [toast, setToast] = useState(null);
  const [pw, setPw] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [saving, setSaving] = useState(false);
  const toastTimer = useRef(null);

  const notify = (msg, bad = false) => {
    setToast({ msg, bad });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  // apply a change to a deep copy of the data
  const update = useCallback((fn) => {
    setData((d) => { const n = structuredClone(d); fn(n); return n; });
    setDirty(true);
  }, []);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/content', { cache: 'no-store' });
    if (r.status === 401) { setStatus('login'); return; }
    const j = await r.json();
    if (!j.ok) { notify(j.error || 'შეცდომა', true); return; }
    setData(j.data); setDirty(false); setStatus('ready');
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  async function login(e) {
    e.preventDefault();
    setLoginErr('');
    const r = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setLoginErr(j.error || 'შეცდომა'); return; }
    setPw(''); load();
  }

  async function logout() {
    if (dirty && !confirm('შეუნახავი ცვლილებები დაიკარგება. გავიდე?')) return;
    await fetch('/api/admin/logout', { method: 'POST' });
    setData(null); setDirty(false); setStatus('login');
  }

  const save = useCallback(async () => {
    if (!data || saving) return;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/content', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { notify('სესია ამოიწურა — შედი თავიდან', true); setStatus('login'); return; }
      if (!r.ok) { notify('შეცდომა: ' + (j.error || r.status), true); return; }
      setDirty(false); notify('✔ შენახულია — საიტზე უკვე ჩანს');
    } finally { setSaving(false); }
  }, [data, saving]);

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [save]);

  function exportFile() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = 'content.json';
    a.click();
  }

  async function importFile(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!d.settings || !Array.isArray(d.categories)) throw new Error();
      setData(d); setSel(0); setDirty(true);
      notify('იმპორტირებულია — არ დაგავიწყდეს შენახვა');
    } catch { notify('ფაილი არასწორია', true); }
  }

  if (status === 'loading') return <div className="adm"><div className="adm-center">იტვირთება…</div></div>;

  if (status === 'login') {
    return (
      <div className="adm">
        <div className="adm-center">
          <form className="login-box" onSubmit={login}>
            <div className="logo-mark">ო</div>
            <h1>ადმინ პანელი</h1>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="პაროლი" autoFocus />
            <button className="btn primary">შესვლა</button>
            <p className="err">{loginErr}</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="adm">
      <header className="bar">
        <b>⚙️ ადმინ პანელი</b>
        <a href="/" target="_blank" className="link">საიტის ნახვა ↗</a>
        {dirty && <span className="dirty">● შეუნახავი ცვლილებები</span>}
        <div className="bar-right">
          <button className="btn" onClick={exportFile} title="სარეზერვო ასლის ჩამოტვირთვა">⬇ ჩამოტვირთვა</button>
          <label className="btn" title="content.json ფაილის ატვირთვა">
            ⬆ იმპორტი<input type="file" accept=".json" hidden onChange={importFile} />
          </label>
          <button className="btn primary" onClick={save} disabled={saving}>{saving ? 'ინახება…' : '💾 შენახვა'}</button>
          <button className="btn ghost" onClick={logout}>გასვლა</button>
        </div>
      </header>

      <div className="layout">
        <nav className="tabs">
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        <main className="panel">
          {tab === 'cats' && <CategoriesTab data={data} update={update} sel={sel} setSel={setSel} />}
          {tab === 'settings' && <SettingsTab data={data} update={update} />}
          {tab === 'areas' && <AreasTab data={data} update={update} />}
          {LISTS[tab] && <Repeater key={tab} listKey={tab} cfg={LISTS[tab]} data={data} update={update} />}
        </main>
      </div>

      <div className={'toast' + (toast ? ' show' : '') + (toast?.bad ? ' bad' : '')}>{toast?.msg}</div>
    </div>
  );
}

function Tools({ i, n, onMove, onDelete }) {
  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };
  return (
    <div className="tools">
      <button type="button" title="ზემოთ" disabled={i === 0} onClick={stop(() => onMove(-1))}>↑</button>
      <button type="button" title="ქვემოთ" disabled={i === n - 1} onClick={stop(() => onMove(1))}>↓</button>
      <button type="button" title="წაშლა" className="del" onClick={stop(() => { if (confirm('წავშალო?')) onDelete(); })}>✕</button>
    </div>
  );
}

function Field({ f, value, onChange, categories }) {
  let input;
  if (f.t === 'area') input = <textarea rows={2} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  else if (f.t === 'num') input = <input type="number" min={1} max={5} value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} />;
  else if (f.t === 'cat') {
    input = (
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    );
  } else input = <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  return <label className={f.w || ''}><span>{f.l}</span>{input}</label>;
}

function Repeater({ listKey, cfg, data, update }) {
  const items = data[listKey] || [];
  return (
    <>
      <div className="head">
        <h2>{cfg.title}</h2>
        <button className="btn primary" onClick={() => update((d) => { (d[listKey] ||= []).push(structuredClone(cfg.blank)); })}>+ დამატება</button>
      </div>
      <div className="rep">
        {items.map((item, i) => (
          <div key={i} className="rep-item">
            <div className="rep-fields">
              {cfg.fields.map((f) => (
                <Field key={f.k} f={f} value={item[f.k]} categories={data.categories}
                  onChange={(v) => update((d) => { d[listKey][i][f.k] = v; })} />
              ))}
            </div>
            <Tools i={i} n={items.length}
              onMove={(dir) => update((d) => move(d[listKey], i, dir))}
              onDelete={() => update((d) => { d[listKey].splice(i, 1); })} />
          </div>
        ))}
        {!items.length && <p className="empty">ცარიელია</p>}
      </div>
    </>
  );
}

function CategoriesTab({ data, update, sel, setSel }) {
  const cats = data.categories;
  const i = Math.min(sel, cats.length - 1);
  const c = cats[i];
  const groups = [...new Set(cats.map((x) => x.group).filter(Boolean))];
  const setCat = (k, v) => update((d) => { d.categories[i][k] = v; });
  const setId = (raw) => {
    const id = raw.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (cats.some((x, idx) => idx !== i && x.id === id)) return; // keep URLs unique
    update((d) => {
      const old = d.categories[i].id;
      d.categories[i].id = id;
      (d.guide || []).forEach((g) => { if (g.category === old) g.category = id; });
    });
  };

  function addCategory() {
    const name = prompt('კატეგორიის სახელი:');
    if (!name) return;
    update((d) => {
      d.categories.push({ id: uniqueSlug(name, d.categories), name, icon: '🔧', group: c?.group || 'სერვისები', short: '', description: '', subs: [] });
    });
    setSel(cats.length);
  }

  return (
    <>
      <div className="head">
        <h2>კატეგორიები და ქვეკატეგორიები</h2>
        <button className="btn primary" onClick={addCategory}>+ ახალი კატეგორია</button>
      </div>
      <div className="cats">
        <div className="cat-list">
          {cats.map((x, idx) => (
            <div key={idx} className={'cat-item' + (idx === i ? ' sel' : '')} onClick={() => setSel(idx)}>
              <span className="ic">{x.icon}</span>
              <span className="nm">{x.name}<small>{x.subs.length} ქვეკატეგორია</small></span>
              <Tools i={idx} n={cats.length}
                onMove={(dir) => { update((d) => move(d.categories, idx, dir)); setSel(idx + dir); }}
                onDelete={() => { update((d) => { d.categories.splice(idx, 1); }); setSel(Math.max(0, idx - 1)); }} />
            </div>
          ))}
        </div>

        <div className="cat-edit">
          {!c ? <p className="empty">დაამატე პირველი კატეგორია</p> : (
            <>
              <div className="grid">
                <label className="xs"><span>ემოჯი</span><input value={c.icon} onChange={(e) => setCat('icon', e.target.value)} /></label>
                <label><span>სახელი</span><input value={c.name} onChange={(e) => setCat('name', e.target.value)} /></label>
                <label>
                  <span>ჯგუფი</span>
                  <input list="groupList" value={c.group} onChange={(e) => setCat('group', e.target.value)} />
                  <datalist id="groupList">{groups.map((g) => <option key={g} value={g} />)}</datalist>
                </label>
              </div>
              <label><span>მოკლე აღწერა (ბარათზე)</span><input value={c.short} onChange={(e) => setCat('short', e.target.value)} /></label>
              <label><span>სრული აღწერა (სერვისის გვერდზე)</span><textarea rows={3} value={c.description} onChange={(e) => setCat('description', e.target.value)} /></label>
              <label>
                <span>ბმული (URL) — მხოლოდ ლათინური ასოები და „-“</span>
                <input value={c.id} onChange={(e) => setId(e.target.value)} />
              </label>
              <p className="hint">გვერდი: <code>/services/{c.id}</code> · <a href={`/services/${c.id}`} target="_blank">ნახვა ↗</a> (შენახვის შემდეგ)</p>

              <div className="head sub">
                <h3>ქვეკატეგორიები / სამუშაოები</h3>
                <button className="btn" onClick={() => update((d) => { d.categories[i].subs.push({ name: 'ახალი სამუშაო', text: '' }); })}>+ დამატება</button>
              </div>
              <div className="subs">
                {c.subs.map((s, si) => {
                  const setSub = (k) => (e) => update((d) => { d.categories[i].subs[si][k] = e.target.value; });
                  return (
                    <div key={si} className="sub-row">
                      <div className="sub-fields">
                        <input placeholder="სახელი" value={s.name} onChange={setSub('name')} />
                        <input className="wide" placeholder="მოკლე აღწერა" value={s.text} onChange={setSub('text')} />
                      </div>
                      <Tools i={si} n={c.subs.length}
                        onMove={(dir) => update((d) => move(d.categories[i].subs, si, dir))}
                        onDelete={() => update((d) => { d.categories[i].subs.splice(si, 1); })} />
                    </div>
                  );
                })}
                {!c.subs.length && <p className="empty">ჯერ არცერთი</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// textarea that edits an array, one item per line (keeps local text so Enter works while typing)
function LinesField({ label, rows, initial, onChange }) {
  const [text, setText] = useState(initial);
  return (
    <label>
      <span>{label}</span>
      <textarea rows={rows} value={text} onChange={(e) => { setText(e.target.value); onChange(e.target.value); }} />
    </label>
  );
}
const lines = (t) => t.split('\n').map((x) => x.trim()).filter(Boolean);

function SettingsTab({ data, update }) {
  const s = data.settings;
  return (
    <>
      <div className="head"><h2>საიტის ტექსტები და კონტაქტი</h2></div>
      <div className="box">
        {SETTINGS.map(([k, l, t]) => (
          <Field key={k} f={{ k, l, t }} value={s[k]} onChange={(v) => update((d) => { d.settings[k] = v; })} />
        ))}
        <LinesField label="მთავარი — უპირატესობები (თითო ხაზზე ერთი)" rows={3}
          initial={(s.heroPoints || []).join('\n')}
          onChange={(t) => update((d) => { d.settings.heroPoints = lines(t); })} />
      </div>
    </>
  );
}

function AreasTab({ data, update }) {
  return (
    <>
      <div className="head"><h2>უბნები</h2></div>
      <div className="box">
        <LinesField label="თითო ხაზზე ერთი უბანი" rows={16} initial={data.areas.join('\n')}
          onChange={(t) => update((d) => { d.areas = lines(t); })} />
      </div>
    </>
  );
}
