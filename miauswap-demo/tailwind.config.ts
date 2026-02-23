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
          // Core neon accent
          pink: '#FF2D78',
          'pink-soft': '#FF6B9D',
          rose: '#E8739A',
          // Dark backgrounds
          dark: '#0B0B1A',
          'dark-card': '#141428',
          'dark-surface': '#1A1A35',
          'dark-border': '#2A2A4A',
          'dark-hover': '#22223E',
          // Text
          white: '#FFFFFF',
          'light': '#E0E0F0',
          'muted': '#8888AA',
          'dim': '#555577',
          // Legacy light colors (kept for gradients/accents)
          cream: '#0B0B1A',
          blush: '#141428',
          pale: '#1A1A35',
          taupe: '#2A2A4A',
          brown: '#FFFFFF',
          'rose-brown': '#8888AA',
          grey: '#666688',
          // Semantic
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
        'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
export default config;
