module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12' },
        earth: { 50:'#fafaf8',100:'#f5f5f0',200:'#e8e5df',300:'#d6d0c8',400:'#b8b0a5',500:'#9a9088',600:'#78706a',700:'#5c5550',800:'#3d3835',900:'#1c1917' }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
        brand: '0 4px 14px rgba(249,115,22,0.3)',
      }
    },
  },
  plugins: [],
};
