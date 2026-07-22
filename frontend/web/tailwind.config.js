const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, 'node_modules/@tremor/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#2563EB",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        background: "#F8FAFC",
        "bi-dark": "#1e2a78",
        "bi-blue": "#243c9b",
        // Tremor palette (required for Select dropdowns and components)
        tremor: {
          brand: {
            faint: "#eff6ff",
            muted: "#bfdbfe",
            subtle: "#60a5fa",
            DEFAULT: "#3b82f6",
            emphasis: "#1d4ed8",
          },
          background: {
            muted: "#f9fafb",
            subtle: "#f3f4f6",
            DEFAULT: "#ffffff",
            emphasis: "#374151",
          },
          border: {
            DEFAULT: "#e5e7eb",
          },
          ring: {
            DEFAULT: "#e5e7eb",
          },
          content: {
            subtle: "#6b7280",
            DEFAULT: "#374151",
            emphasis: "#111827",
            strong: "#111827",
            inverted: "#ffffff",
          },
        },
        // Dark mode Tremor palette
        "dark-tremor": {
          brand: {
            faint: "#0B1229",
            muted: "#172554",
            subtle: "#1e40af",
            DEFAULT: "#3b82f6",
            emphasis: "#60a5fa",
          },
          background: {
            muted: "#131A2B",
            subtle: "#1f2937",
            DEFAULT: "#111827",
            emphasis: "#374151",
          },
          border: {
            DEFAULT: "#374151",
          },
          ring: {
            DEFAULT: "#1f2937",
          },
          content: {
            subtle: "#9ca3af",
            DEFAULT: "#d1d5db",
            emphasis: "#e5e7eb",
            strong: "#f9fafb",
            inverted: "#000000",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
      },
      boxShadow: {
        'kpi': '0 4px 20px rgba(0,0,0,0.05)',
        'kpi-hover': '0 12px 32px rgba(0,0,0,0.10)',
        'header': '0 1px 8px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        'kpi': '18px',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        }
      },
      animation: {
        'spin-reverse': 'spin-reverse 1s linear infinite',
      }
    },
  },
  plugins: [],
};
