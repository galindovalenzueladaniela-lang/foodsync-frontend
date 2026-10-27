import type { Config } from 'tailwindcss';

// Los valores salen de src/styles/tokens.css (paquete de identidad FoodSync).
// Tailwind solo los expone como clases; no se definen colores nuevos aquí.
const v = (name: string) => `var(--color-${name})`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: v('primary'), hover: v('primary-hover'), pressed: v('primary-pressed'), light: v('primary-light'), soft: v('primary-soft') },
        secondary: v('secondary'),
        accent: { DEFAULT: v('accent'), soft: v('accent-soft') },
        background: v('background'),
        subtle: v('subtle'),
        surface: v('surface'),
        elevated: v('elevated'),
        ink: { DEFAULT: v('text'), secondary: v('text-secondary'), muted: v('text-muted') },
        line: { DEFAULT: v('border'), subtle: v('border-subtle'), dashed: v('border-dashed') },
        'on-primary': v('on-primary'),
        success: { DEFAULT: v('success'), soft: v('success-soft'), text: v('success-text') },
        warning: { DEFAULT: v('warning'), soft: v('warning-soft'), text: v('warning-text') },
        error: { DEFAULT: v('error'), soft: v('error-soft'), text: v('error-text') },
        info: { DEFAULT: v('info'), soft: v('info-soft'), text: v('info-text') },
        kds: {
          espresso: v('kds-espresso'),
          'espresso-deep': v('kds-espresso-deep'),
          text: v('kds-text'),
          'text-secondary': v('kds-text-secondary'),
          'text-muted': v('kds-text-muted'),
          nota: v('kds-nota-text'),
          'listo-from': v('kds-listo-from'),
          'listo-to': v('kds-listo-to'),
        },
        neutral: { soft: v('neutral-soft'), text: v('neutral-text') },
        paprika: { soft: v('paprika-soft'), text: v('paprika-text') },
        status: {
          pendiente: v('status-pendiente'),
          preparacion: v('status-en-preparacion'),
          listo: v('status-listo'),
          entregado: v('status-entregado'),
          cancelado: v('status-cancelado'),
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)', xl: 'var(--radius-xl)' },
      boxShadow: {
        xs: 'var(--shadow-xs)', sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)',
        brand: 'var(--shadow-brand)', glass: 'var(--shadow-glass)', focus: 'var(--shadow-focus)',
        card: '0 1px 2px rgba(74, 45, 30, 0.06), 0 10px 24px -18px rgba(74, 45, 30, 0.35)',
        button: 'inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 1px 2px rgba(58, 20, 30, 0.22), 0 6px 14px -6px rgba(74, 30, 40, 0.45)',
      },
      letterSpacing: { caption: '0.16em' },
      maxWidth: { app: '480px' },
    },
  },
  plugins: [],
} satisfies Config;
