module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        byh: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E3A8A',
          900: '#0F172A',
          950: '#0A0F1E',
        },
        violet: {
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        }
      },
      backgroundImage: {
        'byh-gradient':       'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1D4ED8 100%)',
        'byh-gradient-light': 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
        'blue-purple':        'linear-gradient(135deg, #1D4ED8 0%, #6366F1 100%)',
        'green-teal':         'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      boxShadow: {
        card:        '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 20px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)',
        blue:        '0 4px 15px rgba(29,78,216,0.35)',
        'blue-lg':   '0 8px 25px rgba(29,78,216,0.45)',
        premium:     '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
      },
      animation: {
        'slide-up':   'slide-up 0.3s ease-out',
        'fade-in':    'fade-in 0.3s ease-out',
        'pulse-blue': 'pulse-blue 2s infinite',
      },
    },
  },
  plugins: [],
};
