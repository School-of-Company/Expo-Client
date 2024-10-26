import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/entities/**/*.{js,ts,jsx,tsx,mdx}',
    './src/views/**/*.{js,ts,jsx,tsx,mdx}',
    './src/widgets/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          '100': 'var(--color-gray-100)',
          '200': 'var(--color-gray-200)',
          '300': 'var(--color-gray-300)',
          '400': 'var(--color-gray-400)',
          '500': 'var(--color-gray-500)',
          '600': 'var(--color-gray-600)',
          '700': 'var(--color-gray-700)',
          '800': 'var(--color-gray-800)',
          '900': 'var(--color-gray-900)',
        },
        main: {
          '100': 'var(--color-main-100)',
          '200': 'var(--color-main-200)',
          '300': 'var(--color-main-300)',
          '400': 'var(--color-main-400)',
          '500': 'var(--color-main-500)',
          '600': 'var(--color-main-600)',
        },
        transparent: 'transparent',
        black: 'var(--color-black)',
        white: 'var(--color-white)',
        error: 'var(--color-error)',
      },
      fontFamily: {
        Pretendard: ['Pretendard'],
      },
      fontSize: {
        h1: ['1.875rem', { lineHeight: '2.25rem', fontWeight: '500' }],
        h2: ['1.5rem', { lineHeight: '1.8rem', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.8rem', fontWeight: '400' }],
        h4: ['1.25rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        h5: ['1.25rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        body1: ['1.125rem', { lineHeight: '1.35rem', fontWeight: '600' }],
        body2: ['1.125rem', { lineHeight: '1.35rem', fontWeight: '400' }],
        body3: ['1rem', { lineHeight: '1.4rem', fontWeight: '600' }],
        body4: ['1rem', { lineHeight: '1.4rem', fontWeight: '400' }],
        caption1: ['0.875rem', { lineHeight: '1.225rem', fontWeight: '600' }],
        caption2: ['0.875rem', { lineHeight: '1.225rem', fontWeight: '400' }],
        caption3: ['0.75rem', { lineHeight: '1.125rem', fontWeight: '600' }],
        caption4: ['0.75rem', { lineHeight: '1.125rem', fontWeight: '400' }],
      },
      spacing: {
        '0': '0',
        '0.5': '0.1875rem',
        '1': '0.25rem', //4px
        '2': '0.5rem', //8px
        '3': '0.75rem', //12px
        '4': '0.875rem', //14px
        '5': '1rem', // 16px
        '6': '1.25rem', // 20px
        '7': '1.5rem', // 24px
        '8': '1.75rem', // 28px
        '9': '2rem', // 32px
        px: '1px',
      },
      borderRadius: {
        none: '0',
        sm: '0.375rem', // 6px
        md: '0.5rem', // 8px
        lg: '0.75rem', // 12px
        xl: '1rem', // 16px
        '2xl': '1.5rem', // 24px
        '3xl': '2rem', // 32px
        full: '9999px', // 완전한 원형
      },
      borderWidth: {
        '1': '0.0625rem',
      },
      opacity: {
        '0': '0',
        '20': '0.2',
        '40': '0.4',
        '60': '0.6',
        '80': '0.8',
        '100': '1',
      },
    },
    screens: {
      mobile: { max: '640px' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
