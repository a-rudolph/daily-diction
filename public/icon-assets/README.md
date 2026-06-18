# Daily Diction — Icon Assets

Deep tide icon, all sizes for PWA + Next.js + iOS.

## Files

| File | Where it goes | Used for |
|---|---|---|
| `icon-master.svg` | keep in `/design` or wherever (not served) | source of truth, regenerate sizes from this |
| `favicon.ico` | `app/favicon.ico` | browser tab icon (legacy) |
| `favicon-16x16.png` | `public/favicon-16x16.png` | browser tab icon |
| `favicon-32x32.png` | `public/favicon-32x32.png` | browser tab icon |
| `apple-touch-icon.png` | `public/apple-touch-icon.png` | iOS home screen icon |
| `icon-192.png` | `public/icon-192.png` | PWA manifest, Android home screen |
| `icon-512.png` | `public/icon-512.png` | PWA manifest, splash screen |
| `icon-maskable-512.png` | `public/icon-maskable-512.png` | PWA adaptive icon (with safe-area padding) |
| `og-image.png` | `public/og-image.png` | social share preview (Twitter, iMessage, etc.) |

## Next.js App Router setup

### 1. Place files

Drop all the `public/...` files into your `public/` directory. Put `favicon.ico` in `app/` (Next.js picks it up automatically) or in `public/` — either works.

### 2. `app/layout.tsx` metadata

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Diction",
  description: "Personal speaking practice",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Daily Diction",
    description: "Personal speaking practice",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  themeColor: "#0a0e1a",
};
```

### 3. `public/manifest.json`

```json
{
  "name": "Daily Diction",
  "short_name": "Diction",
  "description": "Personal speaking practice",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e1a",
  "theme_color": "#0a0e1a",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## Regenerating

If you want different sizes or to tweak the icon, edit `icon-master.svg` and re-run `generate.py`:

```bash
pip install cairosvg pillow
python3 generate.py
```

## Maskable icon notes

The maskable icon is the same artwork but rendered into the inner 80% of the canvas with the sky colour filling the safe area outside. Android adaptive icons crop in various shapes (circle, squircle, rounded square) and the spec requires content stays within that 80% safe zone. Don't replace the regular `icon-512.png` with the maskable version — they're different and both are needed.
