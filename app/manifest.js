import { getContent } from '@/lib/content';

// /manifest.webmanifest — name and icon when the site is saved to a phone's home screen.
export default async function manifest() {
  const { settings: s } = await getContent();
  return {
    name: s.brand,
    short_name: 'მარტივი',
    description: s.tagline,
    lang: 'ka',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f1b2d',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
