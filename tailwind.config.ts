import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-grotesk)', 'system-ui', 'sans-serif'],
        headline: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-heading)', 'system-ui', 'sans-serif'],
        grotesk: ['var(--font-grotesk)', 'system-ui', 'sans-serif'],
        code: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        // fluid editorial scale
        'fluid-sm': 'clamp(0.9rem, 0.85rem + 0.3vw, 1.05rem)',
        'fluid-lg': 'clamp(1.25rem, 1rem + 1.2vw, 1.75rem)',
        'fluid-xl': 'clamp(2rem, 1.2rem + 3.5vw, 4rem)',
        'fluid-2xl': 'clamp(2.75rem, 1rem + 8vw, 8rem)',
        'fluid-hero': 'clamp(3.5rem, 0.5rem + 14vw, 16rem)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        ember: {
          DEFAULT: 'hsl(var(--ember, var(--primary)))',
          soft: 'hsl(var(--ember-soft, var(--accent)))',
        },
        cream: 'hsl(var(--cream, var(--foreground)))',
        ink: 'hsl(var(--ink, var(--background)))',
        // playful maximalist candy accents
        candy: {
          pink: 'hsl(var(--candy-pink))',
          lime: 'hsl(var(--candy-lime))',
          blue: 'hsl(var(--candy-blue))',
          purple: 'hsl(var(--candy-purple))',
          yellow: 'hsl(var(--candy-yellow))',
        },
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
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-quint': 'cubic-bezier(0.83, 0, 0.17, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: {height: '0'},
          to: {height: 'var(--radix-accordion-content-height)'},
        },
        'accordion-up': {
          from: {height: 'var(--radix-accordion-content-height)'},
          to: {height: '0'},
        },
        marquee: {
          from: {transform: 'translateX(0)'},
          to: {transform: 'translateX(-50%)'},
        },
        shimmer: {
          '100%': {transform: 'translateX(200%)'},
        },
        'float-slow': {
          '0%,100%': {transform: 'translateY(0)'},
          '50%': {transform: 'translateY(-10px)'},
        },
        wiggle: {
          '0%,100%': {transform: 'rotate(-3deg)'},
          '50%': {transform: 'rotate(3deg)'},
        },
        pop: {
          '0%': {transform: 'scale(0.9)', opacity: '0'},
          '60%': {transform: 'scale(1.06)'},
          '100%': {transform: 'scale(1)', opacity: '1'},
        },
        spinny: {
          from: {transform: 'rotate(0deg)'},
          to: {transform: 'rotate(360deg)'},
        },
        bob: {
          '0%,100%': {transform: 'translateY(0) rotate(-2deg)'},
          '50%': {transform: 'translateY(-6px) rotate(2deg)'},
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        marquee: 'marquee 32s linear infinite',
        'marquee-fast': 'marquee 18s linear infinite',
        shimmer: 'shimmer 2.2s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        wiggle: 'wiggle 0.4s ease-in-out infinite',
        pop: 'pop 0.5s cubic-bezier(0.16,1,0.3,1)',
        spinny: 'spinny 8s linear infinite',
        bob: 'bob 4s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
