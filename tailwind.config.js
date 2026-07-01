/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        riotBg: '#F3F0E8',
        riotBgSecondary: '#EAE5DA',
        riotCard: '#FBF9F3',
        riotBorder: '#D8D1C3',
        riotBorderDark: '#B8AE9E',
        riotText: '#172119',
        riotTextSecondary: '#5F685F',
        riotTextMuted: '#858C83',
        riotAccent: '#C4482D',
        riotAccentHover: '#9E351F',
        riotSuccess: '#397A4B',
        riotWarning: '#A66620',
        riotError: '#B8362E',
        atelier: {
          paper: '#F3F0E8',
          ink: '#172119',
          forest: '#16231B',
          citrus: '#D7FF57',
          rust: '#C4482D',
          clay: '#E5D6C5',
          muted: '#5F685F'
        }
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        editorial: ['Fraunces', 'Georgia', 'serif'],
        body: ['Manrope', 'sans-serif'],
        logo: ['Manrope', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      },
      boxShadow: {
        riot: '0 18px 50px rgba(23, 33, 25, 0.08)'
      }
    }
  },
  plugins: []
};
