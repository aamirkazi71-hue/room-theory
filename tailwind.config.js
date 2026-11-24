/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1600px' },
    extend: {
      colors: {
        ivory: { DEFAULT: '#F3F0E9', 2: '#E9E5DC', 3: '#DFDAD0' },
        ink: { DEFAULT: '#252522', soft: '#3A3A36', deep: '#1A1A18', line: '#34342F' },
        stone: { DEFAULT: '#817D74', deep: '#625E57' },
        olive: { DEFAULT: '#777D63', deep: '#5D624C', soft: '#A4A893' },
        taupe: '#B8AD9D',
        mist: '#D5D2CB',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', '"Amiri"', 'Georgia', 'serif'],
        sans: ['"Inter Tight"', '"IBM Plex Sans Arabic"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display — Instrument Serif
        'd-xl': ['clamp(3.4rem, 9.2vw, 10.5rem)', { lineHeight: '0.88', letterSpacing: '-0.025em' }],
        'd-l': ['clamp(2.9rem, 6.4vw, 7rem)', { lineHeight: '0.92', letterSpacing: '-0.02em' }],
        'd-m': ['clamp(2.3rem, 4.4vw, 4.6rem)', { lineHeight: '0.98', letterSpacing: '-0.015em' }],
        'd-s': ['clamp(1.85rem, 2.8vw, 2.9rem)', { lineHeight: '1.04', letterSpacing: '-0.01em' }],
        title: ['clamp(1.4rem, 1.7vw, 1.75rem)', { lineHeight: '1.15', letterSpacing: '-0.005em' }],
        // Text — Inter Tight
        lede: ['clamp(1.075rem, 1.15vw, 1.25rem)', { lineHeight: '1.55', letterSpacing: '-0.005em' }],
        body: ['0.9625rem', { lineHeight: '1.68' }],
        small: ['0.84rem', { lineHeight: '1.55' }],
        micro: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.16em' }],
      },
      spacing: { gutter: 'var(--gutter)', margin: 'var(--margin)', section: 'var(--section)' },
      maxWidth: { page: '1680px', measure: '34rem', 'measure-wide': '42rem' },
      transitionTimingFunction: { out: 'cubic-bezier(0.22, 1, 0.36, 1)', inout: 'cubic-bezier(0.65, 0, 0.35, 1)' },
      borderRadius: { xs: '2px' },
    },
  },
  plugins: [],
};
