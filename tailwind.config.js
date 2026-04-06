/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        riotBg: '#FFFFFF',
        riotBgSecondary: '#F5F5F5',
        riotCard: '#FFFFFF',
        riotBorder: '#E8E8E8',
        riotBorderDark: '#D0D0D0',
        riotText: '#121212',
        riotTextSecondary: '#666666',
        riotTextMuted: '#999999',
        riotAccent: '#FF4D4D',
        riotAccentHover: '#E03E3E',
        riotSuccess: '#22C55E',
        riotWarning: '#F59E0B',
        riotError: '#EF4444'
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        logo: ['Bebas Neue', 'sans-serif']
      },
      boxShadow: {
        riot: '0 1px 3px rgba(0, 0, 0, 0.08)'
      }
    }
  },
  plugins: []
};
