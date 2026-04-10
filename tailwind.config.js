/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0A0E14',
        'dark-surface': '#151923',
        'dark-elevated': '#1E2530',
        'neon-green': '#00FF88',
        'electric-blue': '#00D9FF',
        'intense-orange': '#FF6B35',
        'purple-glow': '#A855F7',
        'protein-blue': '#3B82F6',
        'carbs-orange': '#F59E0B',
        'fats-purple': '#8B5CF6',
        'calories-green': '#10B981',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0AEC0',
        'text-muted': '#4A5568',
      },
      fontFamily: {
        interface: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
