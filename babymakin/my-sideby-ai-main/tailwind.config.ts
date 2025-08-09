
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1400px',
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            lineHeight: '1.8',
            fontSize: '1.125rem',
          },
        },
      },
      fontFamily: {
        sans: ['Clash Grotesk', 'system-ui', 'sans-serif'], // Updated to use Clash Grotesk as default
        body: ['Clash Grotesk', 'system-ui', 'sans-serif'], // Added body font
        condensed: ['Cabin Condensed', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
        headline: ['VC Nudge', 'system-ui', 'sans-serif'],
        subheadline: ['PP Neue Machina', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-sm': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-xl': ['1.875rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-md': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label-sm': ['0.6875rem', { lineHeight: '1.3', fontWeight: '500' }],
      },
      colors: {
        // Sideby Brand Colors - Using HSL values for consistency
        sideby: {
          // Primary brand colors from logo analysis
          orange: {
            50: "hsl(33 100% 97%)",   // #FFF7ED 
            100: "hsl(34 100% 92%)",  // #FFEDD5
            200: "hsl(32 100% 83%)",  // #FED7AA
            300: "hsl(31 100% 72%)",  // #FDBA74
            400: "hsl(27 96% 61%)",   // #FB923C
            500: "hsl(26 100% 49%)",  // #F87201 - Main orange from logo
            600: "hsl(24 91% 48%)",   // #EA580C
            700: "hsl(20 91% 41%)",   // #C2410C
            800: "hsl(17 88% 34%)",   // #9A3412
            900: "hsl(12 84% 28%)",   // #7C2D12
          },
          blue: {
            50: "hsl(214 100% 97%)",  // #EFF6FF
            100: "hsl(214 95% 93%)",  // #DBEAFE
            200: "hsl(213 97% 87%)",  // #BFDBFE
            300: "hsl(212 96% 78%)",  // #93C5FD
            400: "hsl(213 93% 68%)",  // #60A5FA
            500: "hsl(231 82% 53%)",  // #1A40F4 - Main blue from logo
            600: "hsl(221 83% 53%)",  // #2563EB
            700: "hsl(224 76% 48%)",  // #1D4ED8
            800: "hsl(226 71% 40%)",  // #1E40AF
            900: "hsl(224 64% 33%)",  // #1E3A8A
          },
          burgundy: {
            50: "hsl(327 73% 97%)",   // #FDF2F8
            100: "hsl(325 78% 95%)",  // #FCE7F3
            200: "hsl(326 85% 90%)",  // #FBCFE8
            300: "hsl(327 87% 82%)",  // #F9A8D4
            400: "hsl(328 86% 70%)",  // #F472B6
            500: "hsl(316 68% 68%)",  // #F35EB3 - Accent pink/burgundy
            600: "hsl(293 69% 49%)",  // #E879F9
            700: "hsl(294 72% 56%)",  // #D946EF
            800: "hsl(291 64% 42%)",  // #C026D3
            900: "hsl(293 69% 39%)",  // #A21CAF
          },
        },
        // Brand Colors - Using HSL values
        brand: {
          primary: "hsl(26 100% 49%)",      // Sideby orange #F87201
          secondary: "hsl(160 84% 39%)",    // Teal #10B981  
          tertiary: "hsl(221 83% 53%)",     // Blue #2563EB
          accent: "hsl(340 85% 75%)",       // Pink #F99EB3
          warning: "hsl(43 96% 56%)",       // Yellow #F59E0B
          error: "hsl(0 84% 60%)",          // Red #EF4444
          success: "hsl(142 76% 36%)",      // Green #059669
        },
        // Primary color should use the brand orange
        primary: {
          DEFAULT: "hsl(26 100% 49%)",     // #F87201
          foreground: "hsl(0 0% 100%)",    // White text
          50: "hsl(33 100% 97%)",
          100: "hsl(34 100% 92%)",
          200: "hsl(32 100% 83%)",
          300: "hsl(31 100% 72%)",
          400: "hsl(27 96% 61%)",
          500: "hsl(26 100% 49%)",         // Main orange
          600: "hsl(24 91% 48%)",
          700: "hsl(20 91% 41%)",
          800: "hsl(17 88% 34%)",
          900: "hsl(12 84% 28%)",
        },
        // Neutral Colors
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5", 
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0A0A0A",
        },
        // Semantic Colors
        semantic: {
          background: "#FFFFFF",
          surface: "#FAFAFA",
          border: "#E5E5E5",
          input: "#F5F5F5",
          muted: "#A3A3A3",
          text: {
            primary: "#171717",
            secondary: "#525252", 
            muted: "#737373",
            inverse: "#FFFFFF",
          }
        },
        // Legacy color mappings for compatibility
        border: "#E5E5E5",
        input: "#F5F5F5",
        ring: "#3B82F6",
        background: "#FFFFFF",
        foreground: "#171717",
        primary: {
          DEFAULT: "#F87201",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#0D9488",
          foreground: "#FFFFFF",
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4", 
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#F5F5F5",
          foreground: "#171717",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#171717",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#171717",
        },
        // Classroom Cream Colors - Using HSL values from index.css
        classroom: {
          cream: "hsl(var(--classroom-cream))",
          "cream-light": "hsl(var(--classroom-cream-light))",
          "cream-dark": "hsl(var(--classroom-cream-dark))",
          paper: "hsl(var(--classroom-paper))",
          chalk: "hsl(var(--classroom-chalk))",
          wood: "hsl(var(--classroom-wood))",
          warm: "hsl(var(--classroom-warm))",
          accent: "hsl(var(--classroom-accent))",
          // UI Colors
          orange: "hsl(var(--classroom-orange))",
          border: "hsl(var(--classroom-border))",
          "text-secondary": "hsl(var(--classroom-text-secondary))",
        },
        // New Color Palette
        palette: {
          "eraser-pink": "hsl(var(--eraser-pink))",
          "book-brown": "hsl(var(--book-brown))",
          "highlighter-pink": "hsl(var(--highlighter-pink))",
          "highlighter-green": "hsl(var(--highlighter-green))",
          "highlighter-yellow": "hsl(var(--highlighter-yellow))",
        },
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1", 
            transform: "translateY(0)",
          },
        },
        "fade-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "zoom-in": {
          "0%": { 
            opacity: "0",
            transform: "scale(0.8)",
          },
          "100%": { 
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "zoom-out": {
          "0%": { 
            opacity: "1",
            transform: "scale(1)",
          },
          "100%": { 
            opacity: "0",
            transform: "scale(0.8)",
          },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%) skewX(-12deg)" },
          "100%": { transform: "translateX(200%) skewX(-12deg)" },
        },
        "portal-open": {
          "0%": { 
            opacity: "0",
            transform: "scale(0)",
            borderRadius: "50%"
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(0.5)",
            borderRadius: "50%"
          },
          "100%": { 
            opacity: "1",
            transform: "scale(1)",
            borderRadius: "0%"
          },
        },
        "portal-close": {
          "0%": { 
            opacity: "1",
            transform: "scale(1)",
            borderRadius: "0%"
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(0.5)",
            borderRadius: "50%"
          },
          "100%": { 
            opacity: "0",
            transform: "scale(0)",
            borderRadius: "50%"
          },
        },
        "particle-float": {
          "0%": {
            transform: "translateY(0px) rotate(0deg)",
            opacity: "0"
          },
          "10%": {
            opacity: "1"
          },
          "90%": {
            opacity: "1"
          },
          "100%": {
            transform: "translateY(-100px) rotate(360deg)",
            opacity: "0"
          }
        },
        "celebration-burst": {
          "0%": {
            transform: "scale(0) rotate(0deg)",
            opacity: "1"
          },
          "50%": {
            transform: "scale(1.2) rotate(180deg)",
            opacity: "0.8"
          },
          "100%": {
            transform: "scale(2) rotate(360deg)",
            opacity: "0"
          }
        },
        "slide-down": {
          "0%": { height: "0", opacity: "0" },
          "100%": { height: "var(--radix-collapsible-content-height)", opacity: "1" },
        },
        "slide-up": {
          "0%": { height: "var(--radix-collapsible-content-height)", opacity: "1" },
          "100%": { height: "0", opacity: "0" },
        },
        "slide-in-from-top": {
          "0%": {
            transform: "translateY(-100%)",
            opacity: "0"
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1"
          }
        },
        "slide-out-to-top": {
          "0%": {
            transform: "translateY(0)",
            opacity: "1"
          },
          "100%": {
            transform: "translateY(-100%)",
            opacity: "0"
          }
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "fade-down": "fade-down 0.5s ease-out", 
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "zoom-in": "zoom-in 0.4s ease-out",
        "zoom-out": "zoom-out 0.4s ease-out",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
        "portal-open": "portal-open 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
        "portal-close": "portal-close 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
        "particle-float": "particle-float 3s ease-out infinite",
        "celebration-burst": "celebration-burst 0.6s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        "slide-out-to-top": "slide-out-to-top 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/typography')],
} satisfies Config;
