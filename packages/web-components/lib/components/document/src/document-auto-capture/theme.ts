// Local theme palette/tokens used by the auto-capture screen.
// Mirrors id-scanner/src/theme.js so styles port verbatim. The web-components
// `theme-color` attribute can override `colors.primary` at runtime.
export const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#667085',
    primary: '#151F72',
    primaryText: '#FFFFFF',
    secondary: '#F2F4F7',
    secondaryText: '#344054',
    success: '#2CC05C',
    warning: '#F79009',
    error: '#F04438',
    border: '#E4E7EC',
    overlay: 'rgba(0, 0, 0, 0.55)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
  },
  fonts: {
    base: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  shadows: {
    sm: '0 1px 2px rgba(16, 24, 40, 0.05)',
    md: '0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)',
    lg: '0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)',
  },
};
