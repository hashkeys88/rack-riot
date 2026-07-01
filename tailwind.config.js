/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        riotBg: '#FFF8E7',
        riotBgSecondary: '#FFF0CB',
        riotCard: '#FFFFFF',
        riotBorder: '#D9CCE0',
        riotBorderDark: '#A991B5',
        riotText: '#4D2C5E',
        riotTextSecondary: '#725F7C',
        riotTextMuted: '#9A88A3',
        riotAccent: '#FF6B6B',
        riotAccentHover: '#EF525B',
        riotSuccess: '#31896B',
        riotWarning: '#B37700',
        riotError: '#C53D52',
        atelier: {
          paper: '#FFF8E7',
          ink: '#4D2C5E',
          forest: '#4D2C5E',
          citrus: '#FFD95A',
          rust: '#FF6B6B',
          clay: '#A8E6CF',
          muted: '#725F7C'
        },
        play: {
          cream: '#FFF8E7',
          plum: '#4D2C5E',
          coral: '#FF6B6B',
          sky: '#83D8F5',
          butter: '#FFD95A',
          mint: '#A8E6CF'
        }
      },
      fontFamily: {
        display: ['Baloo 2', 'sans-serif'],
        editorial: ['Baloo 2', 'sans-serif'],
        playful: ['Baloo 2', 'sans-serif'],
        body: ['Nunito Sans', 'sans-serif'],
        logo: ['Baloo 2', 'sans-serif'],
        mono: ['Nunito Sans', 'sans-serif']
      },
      boxShadow: {
        riot: '0 14px 0 rgba(77, 44, 94, 0.08)'
      }
    }
  },
  plugins: []
};
