// Design System Theme
export const theme = {
  colors: {
    // Base
    background: 'rgb(3, 7, 18)', // #030712 (gray-950)
    surface: 'rgb(17, 24, 39)',   // gray-900
    surfaceHighlight: 'rgb(31, 41, 55)', // gray-800
    border: 'rgb(55, 65, 81)',    // gray-700

    // Primary accent
    primary: {
      50: 'rgb(239, 246, 255)',
      100: 'rgb(219, 234, 254)',
      200: 'rgb(191, 219, 254)',
      300: 'rgb(147, 197, 253)',
      400: 'rgb(96, 165, 250)',
      500: 'rgb(59, 130, 246)', // blue-500
      600: 'rgb(37, 99, 235)',  // blue-600
      700: 'rgb(29, 78, 216)',  // blue-700
      800: 'rgb(30, 64, 175)',  // blue-800
      900: 'rgb(30, 58, 138)',  // blue-900
    },

    // Secondary accent
    accent: {
      50: 'rgb(254, 252, 232)',
      100: 'rgb(254, 249, 195)',
      200: 'rgb(253, 246, 86)',  // yellow-300
      300: 'rgb(250, 240, 72)',
      400: 'rgb(234, 217, 33)',
      500: 'rgb(202, 189, 19)',
    },

    // Semantic
    success: {
      50: 'rgb(240, 253, 244)',
      100: 'rgb(220, 252, 231)',
      200: 'rgb(187, 247, 208)',
      300: 'rgb(134, 239, 172)',
      400: 'rgb(74, 222, 128)', // green-400
      500: 'rgb(34, 197, 94)',  // green-500
      600: 'rgb(22, 163, 74)',
      700: 'rgb(21, 128, 61)',
      800: 'rgb(22, 101, 52)',
      900: 'rgb(20, 83, 45)',
    },

    warning: {
      400: 'rgb(251, 191, 36)', // yellow-400
      500: 'rgb(245, 158, 11)', // amber-500
      600: 'rgb(234, 138, 0)',
    },

    error: {
      400: 'rgb(248, 113, 113)', // red-400
      500: 'rgb(239, 68, 68)',   // red-500
      600: 'rgb(220, 38, 38)',   // red-600
      700: 'rgb(185, 28, 28)',   // red-700
    },

    text: {
      primary: 'rgb(243, 244, 246)', // gray-100
      secondary: 'rgb(156, 163, 175)', // gray-400
      muted: 'rgb(107, 114, 128)', // gray-500
    },
  },

  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },

  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },

  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, Fira Code, monospace',
    },
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    },
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.5)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
    glow: '0 0 15px rgb(59 130 246 / 0.5)',
    glowSm: '0 0 8px rgb(59 130 246 / 0.4)',
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

export default theme
