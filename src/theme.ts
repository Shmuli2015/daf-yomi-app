export const THEME = {
  colors: {
    background: '#121212', // Dark background
    surface: '#1E1E1E',    // Card background
    primary: '#E0E0E0',    // Main text
    accent: '#C9963C',     // Gold accent
    accentLight: 'rgba(201,150,60,0.1)',
    accentBorder: 'rgba(201,150,60,0.25)',
    success: '#10B981',    // Green for buttons
    successLight: 'rgba(16,185,129,0.15)',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    muted: '#6B7280',      // Muted text
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#52525B',
    border: '#27272A',
    tabBar: '#18181B',     // Bottom tab bar
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    full: 9999,
  },
  shadow: {
    card: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    cardMedium: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 5,
    },
    hero: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
      elevation: 10,
    },
    gold: {
      shadowColor: '#C9963C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    tabBar: {
      shadowColor: '#C9963C',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
} as const;
