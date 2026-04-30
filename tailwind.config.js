
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        sidebar: '#2C3E50',
        accent: {
          DEFAULT: '#3498DB',
          hover: '#2980B9'
        },
        status: {
          new: '#27AE60',
          transfer: '#F39C12'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
