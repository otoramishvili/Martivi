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
