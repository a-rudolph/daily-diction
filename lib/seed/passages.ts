export interface SeedExercise {
  slug: string;
  type: 'passage' | 'wh_question' | 'tongue_twister';
  title: string;
  body: string;
  sortOrder: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Rainbow Passage (public domain, Fairbanks 1960).
 * Split into sentence-level prompts so each phrase fits a single recognition attempt.
 */
const rainbowSentences = [
  'When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow.',
  'The rainbow is a division of white light into many beautiful colors.',
  'These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon.',
  'There is, according to legend, a boiling pot of gold at one end.',
  'People look, but no one ever finds it.',
  'When a man looks for something beyond his reach, his friends say he is looking for the pot of gold at the end of the rainbow.',
];

/**
 * Grandfather Passage (public domain, Darley & Spriestersbach 1978).
 */
const grandfatherSentences = [
  'You wish to know all about my grandfather.',
  'Well, he is nearly 93 years old, yet he still thinks as swiftly as ever.',
  'He dresses himself in an old black frock coat, usually several buttons missing.',
  'A long beard clings to his chin, giving those who observe him a pronounced feeling of the utmost respect.',
  'When he speaks, his voice is just a bit cracked and quivers a bit.',
  'Twice each day he plays skillfully and with zest upon a small organ.',
  'Except in the winter when the snow or ice prevents, he slowly takes a short walk in the open air each day.',
  'We have often urged him to walk more and smoke less, but he always answers, Banana oil!',
];

/** Short original paragraphs for variety. */
const shortPractice = [
  'The bright blue sky stretched far above the calm green fields.',
  'Every morning brings a new opportunity to practice and improve.',
  'Clear speech takes time and patience, but the effort is always worth it.',
  'Breathing slowly and deeply before speaking can help you feel more at ease.',
  'The more you practice, the more natural your speech will feel.',
];

export const passages: SeedExercise[] = [
  ...rainbowSentences.map((body, i) => ({
    slug: `rainbow-${i + 1}`,
    type: 'passage' as const,
    title: 'Rainbow Passage',
    body,
    sortOrder: i + 1,
  })),
  ...grandfatherSentences.map((body, i) => ({
    slug: `grandfather-${i + 1}`,
    type: 'passage' as const,
    title: 'Grandfather Passage',
    body,
    sortOrder: i + 1,
  })),
  ...shortPractice.map((body, i) => ({
    slug: `short-${i + 1}`,
    type: 'passage' as const,
    title: 'Daily Practice',
    body,
    sortOrder: i + 1,
  })),
];
