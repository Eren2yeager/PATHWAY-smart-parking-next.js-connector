/**
 * Design System Theme
 * 
 * Centralized theme configuration for consistent styling across the application.
 * Includes color palette, typography, spacing, shadows, and border radius.
 * 
 * Design Principles:
 * - Light mode: Clean, bright, high contrast for readability
 * - Dark mode: Deep, rich, reduced eye strain with balanced contrast
 * - All colors should be accessible (WCAG AA compliant)
 */

export const theme = {
  /**
   * Color Palette
   * Organized by semantic meaning for consistent usage
   */
  colors: {
    /**
     * Primary - Brand color (Blue family)
     * Light mode: Vibrant, energetic
     * Dark mode: Rich, deep
     */
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    /**
     * Secondary - Accent color (Purple family)
     * Light mode: Soft, elegant
     * Dark mode: Deep, sophisticated
     */
    secondary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6b21a8',
      800: '#581c87',
      900: '#3b0764',
    },
    
    /**
     * Success - Positive actions, green status
     * Light mode: Fresh, natural
     * Dark mode: Rich, vibrant
     */
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    /**
     * Warning - Caution, attention needed
     * Light mode: Warm, attention-grabbing
     * Dark mode: Rich, not too harsh
     */
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    /**
     * Error - Critical issues, destructive actions
     * Light mode: Bright, urgent
     * Dark mode: Deep, not too harsh on eyes
     */
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    /**
     * Info - Informational messages
     * Light mode: Bright, clear
     * Dark mode: Soft, readable
     */
    info: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    
    /**
     * Neutral - Grays for UI elements
     * Light mode: Soft grays
     * Dark mode: Deep grays (not too dark, not too light)
     * Balanced for both modes - no bias
     */
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    /**
     * Status Colors - For badges and indicators
     */
    status: {
      good: '#10b981',
      warning: '#f59e0b',
      critical: '#ef4444',
      offline: '#6b7280',
      online: '#10b981',
    },
    
    /**
     * Slot Status - Parking slot states
     */
    slot: {
      empty: '#10b981',
      occupied: '#ef4444',
      reserved: '#f59e0b',
      disabled: '#6b7280',
    },
    
    /**
     * Detection Colors - For AI/ML detection elements
     */
    detection: {
      plate: '#3b82f6',
      slot: '#10b981',
      vehicle: '#f59e0b',
    },
    
    /**
     * Background Colors
     */
    background: {
      default: '#ffffff',
      paper: '#f8fafc',
      elevated: '#ffffff',
      hover: '#f1f5f9',
      dark: '#0b0b0f',
    },
    
    /**
     * Text Colors
     */
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      disabled: '#9ca3af',
      inverse: '#ffffff',
      muted: '#9ca3af',
    },
    
    /**
     * Border Colors
     */
    border: {
      light: '#e5e7eb',
      main: '#d1d5db',
      dark: '#9ca3af',
      darkHeavy: '#374151',
    },
  },
  
  /**
   * Theme Modes - Complete color configurations
   */
  modes: {
    light: {
      background: {
        default: '#ffffff',
        paper: '#f8fafc',
        elevated: '#ffffff',
        hover: '#f1f5f9',
      },
      text: {
        primary: '#111827',
        secondary: '#6b7280',
        inverse: '#ffffff',
        muted: '#6b7280',
      },
      border: {
        subtle: '#e5e7eb',
        strong: '#d1d5db',
      },
      ring: {
        color: '#3b82f6',
      },
      card: {
        bg: '#ffffff',
        border: '#e5e7eb',
        shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    dark: {
      background: {
        default: '#0b0b0f',
        paper: '#111316',
        elevated: '#181a1f',
        hover: '#1f2228',
      },
      text: {
        primary: '#f3f4f6',
        secondary: '#d1d5db',
        inverse: '#0b0b0f',
        muted: '#9ca3af',
      },
      border: {
        subtle: '#2a2e37',
        strong: '#3a3f4b',
      },
      ring: {
        color: '#60a5fa',
      },
      card: {
        bg: '#111316',
        border: '#2a2e37',
        shadow: 'none',
      },
    },
  },
  
  /**
   * Typography Scale
   * Font sizes, weights, and line heights for consistent text styling
   */
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'Menlo, Monaco, "Courier New", monospace',
    },
    
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },
    
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  /**
   * Spacing Scale
   * Based on 4px base unit for consistent spacing
   */
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },
  
  /**
   * Shadows
   * Elevation levels for depth and hierarchy
   */
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  /**
   * Border Radius
   * Consistent corner rounding
   */
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',   // Fully rounded
  },
  
  /**
   * Transitions
   * Consistent animation timing
   */
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
    },
  },
  
  /**
   * Breakpoints
   * Responsive design breakpoints
   */
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
    wide: '1536px',
  },
  
  /**
   * Z-Index Scale
   * Layering hierarchy
   */
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
  
  /**
   * Focus Styles
   * Keyboard focus indicators for accessibility
   */
  focus: {
    ring: {
      width: '2px',
      style: 'solid',
      color: '#3b82f6',
      offset: '2px',
    },
    ringHighContrast: {
      width: '3px',
      style: 'solid',
      color: '#0d47a1',
      offset: '2px',
    },
    ringInverse: {
      width: '2px',
      style: 'solid',
      color: '#ffffff',
      offset: '2px',
    },
    background: 'rgba(59, 130, 246, 0.1)',
    outline: '2px solid #3b82f6',
    outlineOffset: '2px',
  },
} as const;

/**
 * Helper function to get status color
 */
export function getStatusColor(status: 'good' | 'warning' | 'critical' | 'offline' | 'online'): string {
  return theme.colors.status[status];
}

/**
 * Helper function to get slot status color
 */
export function getSlotStatusColor(status: 'empty' | 'occupied' | 'reserved' | 'disabled'): string {
  return theme.colors.slot[status];
}

/**
 * Helper function to get detection color
 */
export function getDetectionColor(type: 'plate' | 'slot' | 'vehicle'): string {
  return theme.colors.detection[type];
}

export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeShadows = typeof theme.shadows;
export type ThemeBorderRadius = typeof theme.borderRadius;
