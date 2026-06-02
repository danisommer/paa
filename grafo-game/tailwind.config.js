/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b1220',
        panel: '#131c2e',
        'panel-2': '#1b2740',
        ink: '#e6edf6',
        muted: '#93a4be',
        line: '#2a3a57',
        node: {
          idle: '#64748b',
          active: '#facc15',
          done: '#22c55e',
          focus: '#38bdf8',
        },
        good: '#22c55e',
        bad: '#ef4444',
        warn: '#f59e0b',
      },
    },
  },
  plugins: [],
}
