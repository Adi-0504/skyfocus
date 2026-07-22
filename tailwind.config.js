/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skybg: '#427692',
        skysurface: '#F1EEDC',
        skytext: '#475A61',
        skyaccent: '#2C5364',
        skycard: '#F1EEDC',
        skymuted: '#68828C',
        skyhighlight: '#E2DEC3',
      },
      borderRadius: {
        'sky-sm': '12px',
        'sky-card': '20px',
        'sky-lg': '28px',
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          'SF Pro Text',
          'PingFang TC',
          'system-ui',
          'Noto Sans TC',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
