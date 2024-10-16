import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/ui/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          '100': '#212125',
          '200': '#333338',
          '300': '#51515A',
          '450': '#74747F',
          '600': '#9F9FA8',
          '800': '#CFCFD3',
          '900': '#E7E7E9',
        },
        main: {
          '300': '#71A617',
          '400': '#8DCE1C',
          '500': '#A4E335',
          '600': '#C8EE86',
          '800': '#DAF4AE',
        },
        transparent: 'transparent',
        black: '#1C1C1F',
        white: '#ffffff',
        error: '#DF454A',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        Pretendard: ['Pretendard'],
      },
      fontSize: {
        h1: ['3rem', { lineHeight: '3.625rem', fontWeight: '600' }],
        h2: ['2.25rem', { lineHeight: '2.6875rem', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.9375rem', fontWeight: '600' }],
        h4: ['1.125rem', { lineHeight: '1.6875rem', fontWeight: '600' }],
        h5: ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        body1: ['1rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        body2: ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        body3: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        label: ['0.75rem', { lineHeight: '1.125rem', fontWeight: '400' }],
      },
      spacing: {
        '0': '0',
        '0.5': '0.1875rem',
        '1': '0.25rem', //4px
        '2': '0.5rem', //8px
        '3': '0.75rem', //12px
        '4': '1rem', // 16px
        '5': '1.25rem', // 20px
        '6': '1.5rem', // 24px
        '7': '1.75rem', // 28px
        '8': '2rem', // 32px
        px: '1px',
      },
      borderRadius: {
        none: '0',
        sm: '0.5rem', //8px
        md: '0.75rem', // 12px
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
