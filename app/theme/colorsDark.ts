const palette = {
  // Inverted neutrals for dark theme
  neutral100: "#1A1D1F", // Dark background
  neutral200: "#2C3034", // Slightly lighter
  neutral300: "#3E434A", // Card backgrounds
  neutral400: "#565C64", // Borders
  neutral500: "#6E757E", // Disabled text
  neutral600: "#8A9199", // Secondary text
  neutral700: "#A6ADB4", // Primary text dim
  neutral800: "#C2C9D0", // Primary text
  neutral900: "#FFFFFF", // High contrast text

  // Dark primary palette - darker olive green
  primary100: "#1F2A15", // Darkest
  primary200: "#2A3B1A",
  primary300: "#3A4F24",
  primary400: "#4A632E",
  primary500: "#6B8442", // Darker version of #84994F
  primary600: "#84994F", // Original color for highlights

  // Dark secondary palette - darker yellow
  secondary100: "#2A2617", // Darkest
  secondary200: "#3B3420",
  secondary300: "#4F462A",
  secondary400: "#635834",
  secondary500: "#B8A554", // Darker version of #FFE797
  secondary600: "#D4C26B",

  // Dark accent palette - darker orange
  accent100: "#2A1D0E", // Darkest
  accent200: "#3B2814",
  accent300: "#4F361C",
  accent400: "#634424",
  accent500: "#B8822A", // Darker version of #FCB53B
  accent600: "#D49A35",

  // Dark error palette - darker red
  angry100: "#2A1818", // Darkest
  angry200: "#3B2222",
  angry300: "#4F2E2E",
  angry400: "#633A3A",
  angry500: "#8A4142", // Darker version of #B45253
  angry600: "#A54F50",

  overlay20: "rgba(26, 29, 31, 0.2)",
  overlay50: "rgba(26, 29, 31, 0.5)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * Light text on dark background - high contrast
   */
  text: palette.neutral800,
  /**
   * Dimmed text on dark background
   */
  textDim: palette.neutral600,
  /**
   * Dark background
   */
  background: palette.neutral100,
  /**
   * Slightly lighter background for cards, inputs, etc.
   */
  backgroundMuted: palette.neutral200,
  /**
   * Border color for dark theme
   */
  border: palette.neutral400,
  /**
   * Main tint color for dark theme - using brighter primary
   */
  tint: palette.primary600, // Using the brighter version for better visibility
  /**
   * Dark text on tint background
   */
  tintInverse: palette.neutral100,
  /**
   * Inactive tint for dark theme
   */
  tintInactive: palette.neutral500,
  /**
   * Separator color for dark theme
   */
  separator: palette.neutral400,
  /**
   * Error color for dark theme
   */
  error: palette.angry600, // Using brighter error color
  /**
   * Error background for dark theme
   */
  errorBackground: palette.angry100,
  /**
   * Success color for dark theme
   */
  success: palette.primary600,
  /**
   * Warning color for dark theme
   */
  warning: palette.secondary600,
} as const
