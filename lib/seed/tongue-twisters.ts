import type { SeedExercise } from './passages';

/**
 * Standard English tongue twisters for the articulation warmup mode.
 * Difficulty is tagged for future filtering — not surfaced in v1 UI.
 * sortOrder starts at 200 to avoid colliding with passage (0–99) and WH (1–24) ranges.
 */
export const tongueTwisters: SeedExercise[] = [
  {
    slug: 'tt-unique-new-york',
    type: 'tongue_twister',
    title: 'Unique New York',
    body: 'Unique New York, unique New York, you know you need unique New York.',
    sortOrder: 200,
    difficulty: 'easy',
  },
  {
    slug: 'tt-red-leather',
    type: 'tongue_twister',
    title: 'Red leather, yellow leather',
    body: 'Red leather, yellow leather, red leather, yellow leather.',
    sortOrder: 201,
    difficulty: 'easy',
  },
  {
    slug: 'tt-toy-boat',
    type: 'tongue_twister',
    title: 'Toy boat',
    body: 'Toy boat, toy boat, toy boat, toy boat, toy boat.',
    sortOrder: 202,
    difficulty: 'easy',
  },
  {
    slug: 'tt-fresh-fried-fish',
    type: 'tongue_twister',
    title: 'Fresh fried fish',
    body: 'Fresh fried fish, fresh fried fish, fresh fried fish.',
    sortOrder: 203,
    difficulty: 'easy',
  },
  {
    slug: 'tt-she-sells-seashells',
    type: 'tongue_twister',
    title: 'She sells seashells',
    body: 'She sells seashells by the seashore.',
    sortOrder: 204,
    difficulty: 'medium',
  },
  {
    slug: 'tt-woodchuck',
    type: 'tongue_twister',
    title: 'Woodchuck',
    body: 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
    sortOrder: 205,
    difficulty: 'medium',
  },
  {
    slug: 'tt-peter-piper',
    type: 'tongue_twister',
    title: 'Peter Piper',
    body: 'Peter Piper picked a peck of pickled peppers.',
    sortOrder: 206,
    difficulty: 'medium',
  },
  {
    slug: 'tt-irish-wristwatch',
    type: 'tongue_twister',
    title: 'Irish wristwatch',
    body: 'Irish wristwatch, Irish wristwatch, Irish wristwatch.',
    sortOrder: 207,
    difficulty: 'medium',
  },
  {
    slug: 'tt-ragged-rascal',
    type: 'tongue_twister',
    title: 'Round the rugged rock',
    body: 'Round the rugged rock the ragged rascal ran.',
    sortOrder: 208,
    difficulty: 'hard',
  },
  {
    slug: 'tt-sixth-sick-sheikh',
    type: 'tongue_twister',
    title: "Sixth sick sheikh",
    body: "The sixth sick sheikh's sixth sheep's sick.",
    sortOrder: 209,
    difficulty: 'hard',
  },
];
