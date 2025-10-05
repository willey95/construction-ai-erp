import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 존재론적 색상 시스템
        void: '#0A0A0A',
        existence: '#1A1A1A',
        essence: '#2A2A2A',
        phenomenon: '#3A3A3A',
        logos: '#E8E8E8',
        pneuma: '#C0C0C0',
        nous: '#909090',
        telos: '#6B7280',

        // 변증법적 강조색
        thesis: '#00D9FF',
        antithesis: '#FF4757',
        synthesis: '#00B8D4',

        // 목적론적 색상
        amber: '#FFB84D',

        // 기존 변수
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      spacing: {
        // 피타고라스 간격 시스템
        'monad': '4px',
        'dyad': '8px',
        'triad': '12px',
        'tetrad': '16px',
        'pentad': '24px',
        'hexad': '32px',
        'heptad': '48px',
        'ogdoad': '64px',
        'ennead': '96px',
      },
      fontSize: {
        // 황금비 기반 크기
        'infinitesimal': '10px',
        'minimal': '11px',
        'atom': '11px',
        'base': '13px',
        'elevated': '15px',
        'transcendent': '21px',
        'absolute': '34px',
      },
      fontFamily: {
        sans: ['Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'breathe': 'breathe 8s ease-in-out infinite',
        'emerge': 'emerge 0.8s ease-out',
        'levitate': 'levitate 4s ease-in-out infinite',
        'gleam': 'gleam 6s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.01)' },
        },
        emerge: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        levitate: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        gleam: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '0.03' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
