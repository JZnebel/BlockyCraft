/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand colors from BlocklyCraft logo
        'aqua': {
          DEFAULT: '#38E1F5',
          light: '#5CE7F7',
          dark: '#00D7B9',
        },
        'teal': {
          DEFAULT: '#00B497',
          dark: '#008A75',
        },
        'blue': {
          DEFAULT: '#0072C6',
          dark: '#005A9E',
        },
        'orange': {
          DEFAULT: '#FF9F2A',
          light: '#FFB454',
          dark: '#E68A1A',
        },
        'navy': {
          DEFAULT: '#012033',
          light: '#023A5A',
        },
      },
      fontFamily: {
        'display': ['Poppins', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 30px rgba(56, 225, 245, 0.3)',
      },
    },
  },
  plugins: [],
};
