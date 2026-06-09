import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#FFD500',
          light: '#FFE44D',
          dark: '#E6A800',
          deep: '#CC8800',
        },
        navy: {
          DEFAULT: '#0D1B4B',
          light: '#1B2E5E',
          mid: '#243A75',
        },
        verde: {
          DEFAULT: '#009B3A',
          dark: '#007A2E',
          light: '#00C24A',
        },
      },
      fontFamily: {
        bebas: ['var(--font-bebas)', 'Impact', 'cursive'],
        barlow: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-foil': 'linear-gradient(135deg, #B8860B 0%, #FFD700 25%, #FFF8DC 50%, #DAA520 75%, #B8860B 100%)',
        'gold-gradient': 'linear-gradient(160deg, #FFD500 0%, #FFB800 50%, #E6A000 100%)',
        'navy-gradient': 'linear-gradient(160deg, #0D1B4B 0%, #1B2E5E 100%)',
        'hero-gradient': 'radial-gradient(ellipse at 50% -10%, #FFD500 0%, #FFB800 40%, #FF8C00 70%, #E07000 100%)',
        'sticker-top': 'linear-gradient(180deg, #0B2E1A 0%, #0D3A1E 100%)',
        'sticker-bottom': 'linear-gradient(180deg, #FFD500 0%, #FFC200 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        floatB: {
          '0%, 100%': { transform: 'translateY(-8px) rotate(-2deg)' },
          '50%': { transform: 'translateY(6px) rotate(2deg)' },
        },
        floatC: {
          '0%, 100%': { transform: 'translateY(4px) rotate(1deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-1deg)' },
        },
        shimmerSlide: {
          '0%': { transform: 'translateX(-100%) skewX(-15deg)' },
          '100%': { transform: 'translateX(400%) skewX(-15deg)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        goooll: {
          '0%': { opacity: '0', transform: 'scale(0.3) rotate(-8deg)' },
          '60%': { opacity: '1', transform: 'scale(1.15) rotate(2deg)' },
          '80%': { transform: 'scale(0.97) rotate(-0.5deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        progressFill: {
          '0%': { width: '0%' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        starSpin: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.2)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
      },
      animation: {
        float: 'float 3.2s ease-in-out infinite',
        'float-b': 'floatB 4s ease-in-out infinite 0.6s',
        'float-c': 'floatC 3.7s ease-in-out infinite 1.2s',
        shimmer: 'shimmerSlide 4s ease-in-out infinite 2s',
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        goooll: 'goooll 0.7s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
        'pulse-slow': 'pulse 2.5s ease-in-out infinite',
        'progress-fill': 'progressFill 0.6s ease-out both',
        bounce: 'bounce 1.2s ease-in-out infinite',
        'star-spin': 'starSpin 3s linear infinite',
      },
      boxShadow: {
        sticker: '0 24px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.2)',
        'sticker-sm': '0 12px 40px rgba(0,0,0,0.35)',
        gold: '0 8px 32px rgba(230,160,0,0.5)',
        navy: '0 8px 32px rgba(13,27,75,0.5)',
        verde: '0 8px 32px rgba(0,155,58,0.4)',
      },
    },
  },
  plugins: [],
}

export default config
