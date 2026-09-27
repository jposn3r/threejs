import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Chakra Petch"', 'Rajdhani', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', '"Cascadia Mono"', 'Consolas', 'monospace'],
        jp: ['"Noto Sans JP"', '"Yu Gothic"', '"Hiragino Sans"', 'sans-serif'],
      },
      colors: {
        // Night palette (SPEC §2). Neon is for small accents only.
        ink: {
          DEFAULT: '#070a1f',
          glass: 'rgba(10, 14, 40, 0.66)',
          text: '#eaf4ff',
          muted: '#9fb0d8',
        },
        neon: {
          yellow: '#fcee0a',
          cyan: '#3ff2ff',
          magenta: '#ff3fa4',
          mint: '#3dffc0',
          lime: '#b8ff3c',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
