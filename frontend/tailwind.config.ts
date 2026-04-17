import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:         '#0e0d0b',
        surface:    '#141310',
        surface2:   '#1a1916',
        border:     'rgba(255,255,255,0.07)',
        text:       '#e8e4dc',
        muted:      '#8a8680',
        faint:      '#4a4844',
        ember:      '#e85d04',
        gold:       '#f4a261',
        spark:      '#ffd166',
        cyan:       '#48cae4',
        nova:       '#90e0ef',
      },
      fontFamily: {
        display: ['var(--font-barlow)','sans-serif'],
        body:    ['var(--font-inter)','sans-serif'],
      },
      backgroundImage: {
        fire: 'linear-gradient(135deg,#e85d04 0%,#f4a261 40%,#ffd166 70%,#48cae4 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
