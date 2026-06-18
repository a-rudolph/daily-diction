/**
 * Synthetic face assets for "Pretend audience" mode.
 * Images live in /public/audience/ and are served statically.
 *
 * To refresh the set: pnpm tsx scripts/fetch-audience.ts
 * Committed to the repo so no network fetch happens at runtime.
 */

export const AUDIENCE_FACES: string[] = [
  '/audience/face-01.jpg',
  '/audience/face-02.jpg',
  '/audience/face-03.jpg',
  '/audience/face-04.jpg',
  '/audience/face-05.jpg',
  '/audience/face-06.jpg',
  '/audience/face-07.jpg',
  '/audience/face-08.jpg',
  '/audience/face-09.jpg',
  '/audience/face-10.jpg',
  '/audience/face-11.jpg',
  '/audience/face-12.jpg',
  '/audience/face-13.jpg',
  '/audience/face-14.jpg',
  '/audience/face-15.jpg',
  '/audience/face-16.jpg',
  '/audience/face-17.jpg',
  '/audience/face-18.jpg',
];

/** Fisher-Yates shuffle — call once at session start. */
export function shuffleFaces(faces: string[]): string[] {
  const arr = [...faces];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
