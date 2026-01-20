/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        'card-bg': 'var(--card-bg)',
        'text-color': 'var(--text-color)',
        'text-muted': 'var(--text-muted)',
        'border-color': 'var(--border-color)',
        'input-bg': 'var(--input-bg)',
        'result-bg': 'var(--result-bg)',
        'grade-excellent': 'var(--grade-excellent)',
        'grade-good': 'var(--grade-good)',
        'grade-average': 'var(--grade-average)',
        'grade-warning': 'var(--grade-warning)',
        'grade-danger': 'var(--grade-danger)',
        'valid-color': 'var(--valid-color)',
        'invalid-color': 'var(--invalid-color)',
        'warning-color': 'var(--warning-color)',
        'notification-bg': 'var(--notification-bg)',
      },
      backgroundImage: {
        'btn-gradient': 'var(--btn-gradient)',
        'delete-btn-gradient': 'var(--delete-btn-gradient)',
        'success-btn-gradient': 'var(--success-btn-gradient)',
        'page-bg': 'var(--bg-color)',
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        fadeIn: 'fadeIn 0.5s ease-out',
        modalSlideIn: 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        'notification': '0 6px 25px var(--notification-shadow)',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        modalSlideIn: {
          from: { opacity: '0', transform: 'scale(0.8) translateY(-30px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
