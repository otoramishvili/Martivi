// SEO helpers: site address, page titles/descriptions and Google structured data (JSON-LD).
// Everything is built from content.json / the admin, so it stays correct when texts change.

import { socialList } from '@/components/SocialLinks';

// The public address of the site, used for canonical links, the sitemap and structured data.
// Set NEXT_PUBLIC_SITE_URL in Vercel (e.g. https://martivi.ge) once the domain is connected.
// Until then Vercel's own production address is used automatically.
export function siteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : '') ||
    'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}

export const CITY = 'თბილისი';

// Shortens text to a search-result friendly length without cutting a word in half.
export function clip(text, max = 160) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6)).replace(/[\s,.;:—–-]+$/, '') + '…';
}

function phoneE164(phone) {
  return String(phone || '').replace(/[^\d+]/g, '');
}

/* ---------- titles & descriptions ---------- */

export function homeTitle(s) {
  return s.seoTitle?.trim() || `${s.tagline || 'ხელოსანი თბილისში'} | ${s.brand}`;
}

export function homeDescription(s, cats) {
  if (s.seoDescription?.trim()) return clip(s.seoDescription);
  const tail = s.phone ? ` დარეკე: ${s.phone}.` : '';
  const base = s.heroText?.trim() || `${cats.map((c) => c.name).join(', ')}.`;
  return clip(`${base}${tail}`);
}

export function serviceTitle(c) {
  return c.seoTitle?.trim() || `${c.name} თბილისში`;
}

export function serviceDescription(c, s) {
  if (c.seoDescription?.trim()) return clip(c.seoDescription);
  const call = s.phone ? ` დარეკე ${s.phone} ან მოგვწერე WhatsApp-ზე.` : '';
  const lead = `${c.name} თბილისში — `;
  const jobs = c.subs.map((x) => x.name).filter(Boolean);
  // Fit as many job names as possible, keep the call-to-action.
  let list = '';
  for (const j of jobs) {
    const next = list ? `${list}, ${j}` : j;
    if ((lead + next + '.' + call).length > 158) break;
    list = next;
  }
  const body = list ? `${list}.` : clip(c.description || c.short, 158 - lead.length - call.length);
  return clip(lead + body + call);
}

export function keywords(list) {
  return [...new Set(list.map((x) => String(x || '').trim()).filter(Boolean))];
}

/* ---------- structured data ---------- */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// "ყოველდღე 09:00 – 22:00" -> opening hours for every day. Other formats are skipped.
function openingHours(hours) {
  const h = String(hours || '');
  const m = h.match(/(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})/);
  if (!m || !/ყოველდღე|24\/7/.test(h)) return undefined;
  const pad = (x) => x.padStart(2, '0');
  return [{ '@type': 'OpeningHoursSpecification', dayOfWeek: DAYS, opens: `${pad(m[1])}:${m[2]}`, closes: `${pad(m[3])}:${m[4]}` }];
}

export function businessId() {
  return `${siteUrl()}/#business`;
}

function cityNode() {
  return { '@type': 'City', name: CITY, sameAs: 'https://ka.wikipedia.org/wiki/თბილისი' };
}

export function homeJsonLd(content) {
  const { settings: s, categories, faq = [], areas = [] } = content;
  const url = siteUrl();
  const sameAs = socialList(s).filter((x) => !x.soon).map((x) => x.url);

  const business = {
    '@type': 'HomeAndConstructionBusiness',
    '@id': businessId(),
    name: s.brand,
    alternateName: ['Martivi', 'მარტივი'],
    description: homeDescription(s, categories),
    url,
    logo: `${url}/logo-full.webp`,
    image: `${url}/opengraph-image.png`,
    telephone: phoneE164(s.phone) || undefined,
    email: s.email || undefined,
    address: { '@type': 'PostalAddress', addressLocality: CITY, addressCountry: 'GE' },
    geo: { '@type': 'GeoCoordinates', latitude: 41.7151, longitude: 44.8271 },
    areaServed: [cityNode(), ...areas.map((a) => ({ '@type': 'Place', name: a }))],
    openingHoursSpecification: openingHours(s.hours),
    knowsLanguage: 'ka',
    sameAs: sameAs.length ? sameAs : undefined,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'სერვისები',
      itemListElement: categories.map((c) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: c.name, description: c.short || c.description, url: `${url}/services/${c.id}` },
      })),
    },
  };

  const graph = [
    { '@type': 'WebSite', '@id': `${url}/#website`, name: s.brand, alternateName: 'Martivi', url, inLanguage: 'ka', publisher: { '@id': businessId() } },
    business,
  ];

  const qa = faq.filter((f) => f.q && f.a);
  if (qa.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}/#faq`,
      mainEntity: qa.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function serviceJsonLd(c, content) {
  const s = content.settings;
  const url = siteUrl();
  const pageUrl = `${url}/services/${c.id}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: c.name,
        serviceType: c.name,
        category: c.group || undefined,
        description: c.description || c.short,
        url: pageUrl,
        areaServed: cityNode(),
        provider: {
          '@type': 'HomeAndConstructionBusiness',
          '@id': businessId(),
          name: s.brand,
          url,
          telephone: phoneE164(s.phone) || undefined,
          address: { '@type': 'PostalAddress', addressLocality: CITY, addressCountry: 'GE' },
        },
        hasOfferCatalog: c.subs.length
          ? {
              '@type': 'OfferCatalog',
              name: c.name,
              itemListElement: c.subs.map((x) => ({
                '@type': 'Offer',
                itemOffered: { '@type': 'Service', name: x.name, description: x.text || undefined },
              })),
            }
          : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'მთავარი', item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: c.name, item: pageUrl },
        ],
      },
    ],
  };
}

// <script type="application/ld+json"> tag. "<" is escaped so text can never close the tag.
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
