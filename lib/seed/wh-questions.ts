import type { SeedExercise } from './passages';

/**
 * WH questions — 4 per sound (where / what / when / why / who / how = 24 total).
 * These begin with the user's hardest sounds, so they get their own category.
 * Questions are open-ended and conversational to encourage natural speech.
 */
export const whQuestions: SeedExercise[] = [
  // WHERE
  { slug: 'wh-where-1', type: 'wh_question', title: 'Where', body: 'Where do you like to spend your free time?', sortOrder: 1 },
  { slug: 'wh-where-2', type: 'wh_question', title: 'Where', body: 'Where would you travel if you could go anywhere?', sortOrder: 2 },
  { slug: 'wh-where-3', type: 'wh_question', title: 'Where', body: 'Where did you grow up?', sortOrder: 3 },
  { slug: 'wh-where-4', type: 'wh_question', title: 'Where', body: 'Where do you feel most relaxed and comfortable?', sortOrder: 4 },

  // WHAT
  { slug: 'wh-what-1', type: 'wh_question', title: 'What', body: 'What is something you are proud of?', sortOrder: 5 },
  { slug: 'wh-what-2', type: 'wh_question', title: 'What', body: 'What do you enjoy doing on weekends?', sortOrder: 6 },
  { slug: 'wh-what-3', type: 'wh_question', title: 'What', body: 'What would you change about your daily routine?', sortOrder: 7 },
  { slug: 'wh-what-4', type: 'wh_question', title: 'What', body: 'What matters most to you in life?', sortOrder: 8 },

  // WHEN
  { slug: 'wh-when-1', type: 'wh_question', title: 'When', body: 'When do you feel most energized during the day?', sortOrder: 9 },
  { slug: 'wh-when-2', type: 'wh_question', title: 'When', body: 'When did you last try something completely new?', sortOrder: 10 },
  { slug: 'wh-when-3', type: 'wh_question', title: 'When', body: 'When do you feel most focused and productive?', sortOrder: 11 },
  { slug: 'wh-when-4', type: 'wh_question', title: 'When', body: 'When was the last time you laughed out loud?', sortOrder: 12 },

  // WHY
  { slug: 'wh-why-1', type: 'wh_question', title: 'Why', body: 'Why is it important to take care of your health?', sortOrder: 13 },
  { slug: 'wh-why-2', type: 'wh_question', title: 'Why', body: 'Why do people enjoy spending time in nature?', sortOrder: 14 },
  { slug: 'wh-why-3', type: 'wh_question', title: 'Why', body: 'Why is it helpful to set goals for yourself?', sortOrder: 15 },
  { slug: 'wh-why-4', type: 'wh_question', title: 'Why', body: 'Why do we value the opinions of people we trust?', sortOrder: 16 },

  // WHO
  { slug: 'wh-who-1', type: 'wh_question', title: 'Who', body: 'Who has had the biggest influence on your life?', sortOrder: 17 },
  { slug: 'wh-who-2', type: 'wh_question', title: 'Who', body: 'Who do you look up to and why?', sortOrder: 18 },
  { slug: 'wh-who-3', type: 'wh_question', title: 'Who', body: 'Who would you spend your ideal day with?', sortOrder: 19 },
  { slug: 'wh-who-4', type: 'wh_question', title: 'Who', body: 'Who inspires you to keep going when things are difficult?', sortOrder: 20 },

  // HOW
  { slug: 'wh-how-1', type: 'wh_question', title: 'How', body: 'How do you start your morning on a good day?', sortOrder: 21 },
  { slug: 'wh-how-2', type: 'wh_question', title: 'How', body: 'How do you handle situations that feel overwhelming?', sortOrder: 22 },
  { slug: 'wh-how-3', type: 'wh_question', title: 'How', body: 'How do you stay motivated when progress feels slow?', sortOrder: 23 },
  { slug: 'wh-how-4', type: 'wh_question', title: 'How', body: 'How would you describe your perfect weekend?', sortOrder: 24 },
];
