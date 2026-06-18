/**
 * fetch-audience.ts
 * Downloads ~18 synthetic face images into public/audience/.
 *
 * Source: thispersondoesnotexist.com — each request returns a fresh,
 * randomly generated face (AI-generated, no real person).
 *
 * Usage:
 *   pnpm tsx scripts/fetch-audience.ts
 *
 * Images are committed to the repo so they are bundled at build time.
 * Re-run this script only if you want a fresh set of faces.
 *
 * Variety guidance: the site randomises age, gender, ethnicity, and expression
 * on every request. Run the script until you have a set that looks diverse and
 * none look judgmental or stern. Manually delete/re-fetch individual files if
 * needed.
 */

import fs from 'fs';
import path from 'path';

const OUT_DIR = path.join(process.cwd(), 'public', 'audience');
const COUNT = 18;
const DELAY_MS = 1200; // be polite to the server

const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchFace(index: number): Promise<void> {
  const filename = `face-${String(index).padStart(2, '0')}.jpg`;
  const outPath = path.join(OUT_DIR, filename);

  if (fs.existsSync(outPath)) {
    console.log(`  skip  ${filename} (already exists)`);
    return;
  }

  // thispersondoesnotexist.com returns a unique face on every request.
  // A cache-buster query param ensures we get a fresh image each time.
  const url = `https://thispersondoesnotexist.com/?v=${index}-${Date.now()}`;

  const res = await fetch(url, {
    headers: {
      // The site expects a browser-like UA to serve the image.
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching face ${index}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buffer);
  console.log(`  saved ${filename} (${Math.round(buffer.length / 1024)} KB)`);
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Fetching ${COUNT} synthetic faces into ${OUT_DIR}\n`);

  for (let i = 1; i <= COUNT; i++) {
    try {
      await fetchFace(i);
    } catch (err) {
      console.error(`  ERROR face-${i}:`, err);
    }
    if (i < COUNT) await sleep(DELAY_MS);
  }

  // Write manifest listing committed filenames
  const files = fs
    .readdirSync(OUT_DIR)
    .filter((f) => f.endsWith('.jpg'))
    .sort();

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(files, null, 2) + '\n');
  console.log(`\nWrote manifest: ${files.length} files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
