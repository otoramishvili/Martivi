// Facebook / Instagram / TikTok links.
// Links come from the admin (საიტის ტექსტები). A field that is empty (or only the bare
// site address, e.g. https://www.instagram.com/) counts as "not set":
//   - Facebook falls back to the real page below;
//   - Instagram / TikTok are shown greyed out, not clickable, with a "მალე" tooltip.

const DEFAULTS = {
  facebook: 'https://www.facebook.com/profile.php?id=61595664435265',
  instagram: '',
  tiktok: '',
};

const SOON = 'მალე დაემატება';

// True when the value is empty or just the network's home page (a placeholder).
function isUnset(url) {
  const u = String(url || '').trim();
  if (!u) return true;
  try {
    const { pathname, search } = new URL(u.includes('://') ? u : 'https://' + u);
    return (pathname === '/' || pathname === '') && !search;
  } catch {
    return true;
  }
}

const ICONS = {
  facebook: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5H16.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
      <path d="M16.6 3c.4 2.2 1.7 3.6 3.9 3.8v3.1c-1.4.1-2.7-.3-3.9-1.1v6.1c0 3.4-2.5 5.8-5.7 5.8A5.6 5.6 0 0 1 5.2 15c0-3.5 3-6.1 6.6-5.6v3.2c-.5-.2-1-.2-1.5-.1-1.3.2-2 1.2-1.9 2.5.1 1.3 1.1 2.2 2.5 2.1 1.4 0 2.4-1.1 2.4-2.7V3h3.3z" />
    </svg>
  ),
};

const LABELS = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok' };

export function socialList(settings = {}) {
  return ['facebook', 'instagram', 'tiktok']
    .map((k) => {
      const url = isUnset(settings[k]) ? DEFAULTS[k] : String(settings[k]).trim();
      return { key: k, url, soon: !url };
    });
}

export default function SocialLinks({ settings, className = '' }) {
  const items = socialList(settings);
  if (!items.length) return null;
  return (
    <div className={'social ' + className}>
      {items.map(({ key, url, soon }) =>
        soon ? (
          <span key={key} className={'social-' + key + ' is-soon'} data-soon={SOON} role="img" aria-label={LABELS[key] + ' — ' + SOON} tabIndex={0}>
            {ICONS[key]}
          </span>
        ) : (
          <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={LABELS[key]} title={LABELS[key]} className={'social-' + key}>
            {ICONS[key]}
          </a>
        )
      )}
    </div>
  );
}
