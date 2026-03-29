import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        miau: {
          // Core neon accent (same in both themes)
          pink: '#FF2D78',
          'pink-soft': '#FF6B9D',
          rose: '#E8739A',
          // Theme-adaptive backgrounds
          dark: 'var(--miau-bg)',
          'dark-card': 'var(--miau-card)',
          'dark-surface': 'var(--miau-surface)',
          'dark-border': 'var(--miau-border)',
          'dark-hover': 'var(--miau-hover)',
          // Theme-adaptive text
          white: 'var(--miau-text)',
          'light': 'var(--miau-text-light)',
          'muted': 'var(--miau-text-muted)',
          'dim': 'var(--miau-text-dim)',
          // Legacy aliases (point to adaptive vars)
          cream: 'var(--miau-bg)',
          blush: 'var(--miau-card)',
          pale: 'var(--miau-surface)',
          taupe: 'var(--miau-border)',
          brown: 'var(--miau-text)',
          'rose-brown': 'var(--miau-text-muted)',
          grey: 'var(--miau-text-dim)',
          // Semantic (same in both)
          success: '#00F5A0',
          warning: '#FFB800',
          error: '#FF4466',
          // Neon glow
          'glow-pink': '#FF2D7840',
          'glow-green': '#00F5A040',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 45, 120, 0.15)',
        'glow-lg': '0 0 40px rgba(255, 45, 120, 0.2)',
        'glow-green': '0 0 20px rgba(0, 245, 160, 0.15)',
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
    },
  },
  plugins: [],
};
export default config;
