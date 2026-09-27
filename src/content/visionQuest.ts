/**
 * Vision Quest — Jake's weekly newsletter. Editions are hard-coded for now;
 * the plan (SPEC §7) is to pull them from the Beehiiv RSS feed at build time.
 */
export const visionQuest = {
  name: 'Vision Quest',
  tagline: 'The frontier, explained by someone who builds it',
  blurb: 'A free weekly newsletter on AI, spatial computing, robotics, biotech and space. 138+ editions, every Wednesday since January 2024.',
  href: 'https://visionquest.news',
  latest: [
    { date: 'SEP 23', title: 'Jev, Muse, and Odyssey-3: New Decider, Agent & World Model' },
    { date: 'SEP 16', title: 'iPhone Duo, Fly Brain Computing, The AI Slowdown Debate' },
    { date: 'SEP 09', title: "GPT-6 Astra, Tesla's Cybercab, AlphaGenome Atlas" },
  ],
} as const
