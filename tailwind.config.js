/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace', 'system-ui'],
        retro: ['"Courier New"', 'monospace'],
      },
      colors: {
        gameboy: {
          darkest: '#0f380f',
          dark: '#306230',
          light: '#8bac0f',
          lightest: '#9bbc0f',
        },
        audit: {
          blue: '#1e3a8a',
          navy: '#0f172a',
          amber: '#f59e0b',
          crimson: '#dc2626',
          emerald: '#059669',
        }
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px rgba(0, 0, 0, 0.8)',
        'pixel-sm': '2px 2px 0px 0px rgba(0, 0, 0, 0.8)',
        'pixel-lg': '6px 6px 0px 0px rgba(0, 0, 0, 0.8)',
        'pixel-inset': 'inset 3px 3px 0px rgba(255,255,255,0.2), inset -3px -3px 0px rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [],
};
