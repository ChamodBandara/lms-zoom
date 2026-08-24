import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'], // Retaining dark mode based on the 'class' strategy
  content: [
    './index.html', 
    './src/**/*.{js,ts,jsx,tsx}', // Define content paths to watch for class names
    './pages/**/*.{js,ts,jsx,tsx}',  // If using Next.js, include pages directory
    './components/**/*.{js,ts,jsx,tsx}',  // For components
    './app/**/*.{js,ts,jsx,tsx}',  // For app directory in Next.js
  ],
  theme: {
    extend: {
      fontFamily: {
        sinhala: ['"Noto Sans Sinhala"', 'sans-serif'], // Added custom font family
      },
      screens: {
        sm: '640px',  // Small devices (mobile)
        md: '768px',  // Tablets
        'ipad': { 'min': '1024px', 'max': '1366px' }, // Custom ipad breakpoint
        lg: '1024px', // Desktops
        xl: '1280px', // Extra-large screens
        '2xl': '1536px', // Larger screens (optional)
      },
      borderColor: {
        theme: '#6F147B', // Custom border color
      },
      textColor: {
        theme: '#6F147B', // Custom text color
      },
      backgroundColor: {
        theme: '#6F147B', // Custom background color
      },
      colors: {
        theme: '#6F147B', // Custom primary theme color
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
      boxShadow: {
        custom: '0px 7px 28.7px 0px rgba(0, 0, 0, 0.25)', // Custom shadow
      },
      borderRadius: {
        lg: 'var(--radius)', // Custom border radius using CSS variables
        md: 'calc(var(--radius) - 2px)', // Adjusted border radius for medium
        sm: 'calc(var(--radius) - 4px)', // Adjusted border radius for small
      },
      // Optional: Add any animations you wish to customize or extend
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite', // Slow bounce animation
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate], // Added the plugin for animation utilities
};
