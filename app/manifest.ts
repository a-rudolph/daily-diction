import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Daily Diction',
    short_name: 'Daily Diction',
    description: 'Personal speaking practice — read aloud, build your habit.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8fafc',
    theme_color: '#4f46e5',
    icons: [
      { src: '/pwa-icon?size=192', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-icon?size=512', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-icon?size=512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
