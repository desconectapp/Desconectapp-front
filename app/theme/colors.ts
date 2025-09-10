const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F8F9FA",
  neutral300: "#E9ECEF",
  neutral400: "#CED4DA",
  neutral500: "#ADB5BD",
  neutral600: "#6C757D",
  neutral700: "#495057",
  neutral800: "#343A40",
  neutral900: "#212529",

  // New primary palette based on #84994F (olive green)
  primary100: "#F4F6F1",
  primary200: "#E6EBD9",
  primary300: "#D1DDB8",
  primary400: "#BBCF97",
  primary500: "#84994F", // Main primary color
  primary600: "#6B7A3F",

  // Secondary palette based on #FFE797 (light yellow)
  secondary100: "#FFFEF7",
  secondary200: "#FFFCE6",
  secondary300: "#FFF9CC",
  secondary400: "#FFF2B3",
  secondary500: "#FFE797", // Main secondary color
  secondary600: "#E6D085",

  // Accent palette based on #FCB53B (orange)
  accent100: "#FEF8F1",
  accent200: "#FEF0DC",
  accent300: "#FDE5C7",
  accent400: "#FDDAB2",
  accent500: "#FCB53B", // Main accent color
  accent600: "#E3A235",

  // Error palette based on #B45253 (muted red)
  angry100: "#F8F2F2",
  angry200: "#F0E0E0",
  angry300: "#E5CCCC",
  angry400: "#DAB8B8",
  angry500: "#B45253", // Main error color
  angry600: "#A24849",

  overlay20: "rgba(33, 37, 41, 0.2)",
  overlay50: "rgba(33, 37, 41, 0.5)",
} as const

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral100,
  /**
   * Muted background for cards, inputs, etc.
   */
  backgroundMuted: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral300,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * The inverse tinting color (for text on tint background).
   */
  tintInverse: palette.neutral100,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral400,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   */
  errorBackground: palette.angry100,
  /**
   * Success color.
   */
  success: palette.primary500,
  /**
   * Warning color.
   */
  warning: palette.accent500,
} as const
