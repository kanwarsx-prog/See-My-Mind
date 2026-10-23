/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        topbar: 'var(--bg-topbar)',
        borderMain: 'var(--border-main)',
        borderStrong: 'var(--border-strong)',
        cardBg: 'var(--card-bg)',
        cardSubtle: 'var(--card-bg-subtle)',
        textMain: 'var(--text-primary)',
        textSub: 'var(--text-secondary)',
        textDim: 'var(--text-muted)',
        textHead: 'var(--text-heading)',
        sidebarBg: 'var(--sidebar-bg)',
        sidebarBorder: 'var(--sidebar-border)',
        sidebarPrimary: 'var(--sidebar-text-primary)',
        sidebarSecondary: 'var(--sidebar-text-secondary)',
        sidebarMuted: 'var(--sidebar-text-muted)',
        sidebarHover: 'var(--sidebar-hover-bg)',
        sidebarBadge: 'var(--sidebar-badge-bg)',
        sidebarActive: 'var(--sidebar-active-bg)',
        sidebarActiveText: 'var(--sidebar-active-text)',
        mint: {
          DEFAULT: 'var(--color-mint)',
          light: '#C9E4DE',
          pale: '#E8F4F1',
        },
        teal: {
          DEFAULT: 'var(--color-teal)',
          dark: 'var(--color-teal-dark)',
          medium: '#3D8C82',
        },
        navy: {
          DEFAULT: '#1A3A4A',
          light: '#2D5A6E',
          lighter: '#3A6A80',
        },
        coral: {
          DEFAULT: 'var(--color-coral)',
          dark: 'var(--color-coral-dark)',
          light: '#FCDCD6',
        },
        amber: {
          DEFAULT: 'var(--color-amber)',
          dark: 'var(--color-amber-dark)',
          light: '#FBE8C8',
        },
        purple: {
          DEFAULT: 'var(--color-purple)',
          dark: 'var(--color-purple-dark)',
          light: '#DDD8F0',
        },
        green: {
          DEFAULT: '#4CAF82',
          light: '#D4EDE0',
        },
        emerald: {
          DEFAULT: 'var(--color-emerald)',
        },
        gold: {
          DEFAULT: '#E8B84B',
          light: '#FDF3DC',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
      },
    },
  },
  plugins: [],
}
