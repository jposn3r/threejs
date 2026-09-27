/**
 * Career content — the single source for the Central station panels and,
 * later, the 2D classic view. Drafted from jakeposner.com and the May 2023
 * resume. Items marked `todo` are gaps for Jake to fill in.
 */

export interface Role {
  org: string
  title: string
  /** Display dates. */
  when: string
  summary: string
  stats?: string[]
  link?: { label: string; href: string }
  /** Something to confirm or fill in before launch. */
  todo?: string
}

export const profile = {
  name: 'Jake Posner',
  headline: 'Turning vision into products that move the world',
  role: 'Engineering & Product Leader',
  intro:
    'Engineering and product leader with ten-plus years building consumer products across streaming and spatial computing, on devices where every millisecond and megabyte counts.',
  links: [
    { label: 'jakeposner.com', href: 'https://jakeposner.com' },
    { label: 'roninventures.dev', href: 'https://roninventures.dev' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jake-posner' },
  ],
} as const

export const roles: Role[] = [
  {
    org: 'Netflix',
    title: 'Engineering Manager, TV product UI',
    when: 'NOW',
    summary: 'Leads the team that owns the TV product UI used by hundreds of millions of members across TVs, streaming devices and consoles.',
    todo: 'Start date, and one or two concrete wins that can be shared publicly.',
  },
  {
    org: 'Meta Reality Labs',
    title: 'Engineering Manager, Quest OS Navigation',
    when: '2022 –',
    summary:
      'Led the Navigator team behind the Quest home screen, the highest-traffic surface in the OS. Drove its largest redesign and shipped a new navigation paradigm across device generations.',
    link: { label: 'About Navigator', href: 'https://www.meta.com/help/quest/133727602066940/' },
    todo: 'End date.',
  },
  {
    org: 'fuboTV',
    title: 'Software Engineer → Director of Engineering',
    when: '2018 – 2022',
    summary: 'Grew from engineer to Director. Stood up 6 product and 6 platform teams, shipped interactive live-sports features and launched in Spain and Canada.',
    stats: ['Roku releases: 5 wks → weekly', 'Crash rate: 13% → 0.1%'],
  },
  {
    org: 'Ronin Ventures',
    title: 'Founder',
    when: 'NOW',
    summary: 'Software and experiments: apps and games built with AI.',
    link: { label: 'roninventures.dev', href: 'https://roninventures.dev' },
    todo: 'Pick 2–3 projects to feature (the live site listed none when drafted).',
  },
  {
    org: 'Endeavor Streaming',
    title: 'Software Engineer',
    when: '2017 – 2018',
    summary: 'Roku apps for UFC, NBA League Pass International, Univision and PokerGO.',
  },
  {
    org: 'ProjectNightOwl.tv',
    title: 'Co-founder & Principal Engineer',
    when: '2016 – 2018',
    summary: 'Esports social hub. Watch. Share. GG. The first project, and the one that got him hired.',
  },
]
