// Pure helpers — safe to use in client and server components.
export function priceLabel(p) {
  return /^\d/.test(String(p ?? '')) ? `${p} ₾-დან` : String(p ?? '');
}

export function groupCategories(categories) {
  const groups = [];
  for (const c of categories) {
    const name = c.group || 'სხვა';
    let g = groups.find((x) => x.name === name);
    if (!g) groups.push((g = { name, items: [] }));
    g.items.push(c);
  }
  return groups;
}

export function telHref(phone) {
  return 'tel:' + String(phone || '').replace(/[^\d+]/g, '');
}

export function waHref(num) {
  return 'https://wa.me/' + String(num || '').replace(/\D/g, '');
}

// „სარემონტო სამუშაოები“: a second menu next to „სერვისები“, with its own categories.
export const repairsOf = (content) => (Array.isArray(content?.repairs) ? content.repairs : []);
export const repairsTitle = (s) => String(s?.repairsTitle || '').trim() || 'სარემონტო სამუშაოები';

// A subcategory written as a web address (e.g. www.manavigreenlakes.com) becomes a clickable link.
export function siteLink(text) {
  const t = String(text || '').trim();
  if (!/^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(t)) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
