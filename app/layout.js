import './globals.css';
import VisitTracker from '@/components/VisitTracker';
import { getContent } from '@/lib/content';
import { siteUrl } from '@/lib/seo';

export const viewport = {
  themeColor: '#0f1b2d',
};

export async function generateMetadata() {
  const { settings: s } = await getContent();
  const url = siteUrl();
  return {
    metadataBase: new URL(url),
    title: { default: s.tagline || 'ხელოსანი თბილისში', template: `%s | ${s.brand}` },
    description: 'ხელოსნები და სახლის სერვისები თბილისში.',
    applicationName: s.brand,
    authors: [{ name: s.brand, url }],
    creator: s.brand,
    publisher: s.brand,
    category: 'home services',
    openGraph: {
      type: 'website',
      locale: 'ka_GE',
      siteName: s.brand,
    },
    twitter: { card: 'summary_large_image' },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    // Google Search Console / Bing / Yandex ownership codes, set in Vercel → Environment Variables.
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      yandex: process.env.YANDEX_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
    },
    other: { 'geo.region': 'GE-TB', 'geo.placename': 'Tbilisi', 'geo.position': '41.7151;44.8271', ICBM: '41.7151, 44.8271' },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="ka">
      <head>
        {/* Font loads in parallel with the page instead of after the CSS (faster first paint). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@400;500;600;700;800;900&display=swap"
        />
      </head>
      <body id="top">
        {children}
        <VisitTracker />
        {/* Vercel Web Analytics — visitor counts in Vercel → project → Analytics (works only on Vercel) */}
        <script dangerouslySetInnerHTML={{ __html: 'window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};' }} />
        <script defer src="/_vercel/insights/script.js" />
      </body>
    </html>
  );
}
