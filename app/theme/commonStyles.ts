import { ViewStyle, TextStyle } from "react-native"
import { ThemedStyle } from "./index"

/**
 * Common reusable styles for consistent UI across the app
 */

// CONTAINER STYLES
export const containers = {
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  } as ViewStyle,

  screenPadded: (theme: any): ViewStyle => ({
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  }),

  centered: {
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  row: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,

  column: {
    flexDirection: "column",
  } as ViewStyle,

  section: (theme: any): ViewStyle => ({
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundMuted,
  }),

  card: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.palette.neutral900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),
}

// BUTTON STYLES
export const buttons = {
  base: (theme: any): ViewStyle => ({
    borderRadius: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  }),

  primary: (theme: any): ViewStyle => ({
    ...buttons.base(theme),
    backgroundColor: theme.colors.tint,
  }),

  primaryPressed: (theme: any): ViewStyle => ({
    ...buttons.base(theme),
    opacity: 0.5,
  }),

  primaryDisabled: (theme: any): ViewStyle => ({
    ...buttons.base(theme),
    backgroundColor: theme.colors.backgroundMuted,
  }),

  secondary: (theme: any): ViewStyle => ({
    ...buttons.base(theme),
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  }),

  danger: (theme: any): ViewStyle => ({
    ...buttons.base(theme),
    backgroundColor: theme.colors.error,
  }),

  link: {
    backgroundColor: "transparent",
    padding: 0,
    minHeight: "auto",
  } as ViewStyle,

  floating: (theme: any): ViewStyle => ({
    position: "absolute",
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.tint,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  }),
}

// BUTTON TEXT STYLES
export const buttonTexts = {
  primary: (theme: any): TextStyle => ({
    color: theme.colors.tintInverse,
    fontSize: 16,
    fontWeight: "600",
  }),

  primaryDisabled: (theme: any): TextStyle => ({
    color: theme.colors.textDim,
    fontSize: 16,
    fontWeight: "600",
  }),

  secondary: (theme: any): TextStyle => ({
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  }),

  danger: (theme: any): TextStyle => ({
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  }),

  link: (theme: any): TextStyle => ({
    color: theme.colors.tint,
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "underline",
  }),
}

// TEXT STYLES
export const texts = {
  heading: (theme: any): TextStyle => ({
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  }),

  subheading: (theme: any): TextStyle => ({
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  }),

  title: (theme: any): TextStyle => ({
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  }),

  body: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  }),

  bodySmall: (theme: any): TextStyle => ({
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  }),

  caption: (theme: any): TextStyle => ({
    fontSize: 12,
    color: theme.colors.textDim,
    lineHeight: 16,
  }),

  label: (theme: any): TextStyle => ({
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  }),

  error: (theme: any): TextStyle => ({
    fontSize: 14,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  }),

  success: (theme: any): TextStyle => ({
    fontSize: 14,
    color: theme.colors.palette.primary500,
    marginTop: theme.spacing.xs,
  }),

  warning: (theme: any): TextStyle => ({
    fontSize: 14,
    color: "#FFC107",
    marginTop: theme.spacing.xs,
  }),

  center: {
    textAlign: "center",
  } as TextStyle,
}

// INPUT STYLES
export const inputs = {
  base: (theme: any): ViewStyle => ({
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    minHeight: 50,
  }),

  error: (theme: any): ViewStyle => ({
    borderColor: theme.colors.error,
  }),

  focused: (theme: any): ViewStyle => ({
    borderColor: theme.colors.tint,
    shadowColor: theme.colors.tint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  }),

  textArea: (theme: any): ViewStyle => ({
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    minHeight: 100,
  }),

  text: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.text,
  }),

  textAreaText: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.text,
    textAlignVertical: "top",
  }),
}

// MODAL STYLES
export const modals = {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  } as ViewStyle,

  container: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.lg,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  }),

  header: (theme: any): ViewStyle => ({
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  }),

  title: (theme: any): TextStyle => ({
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
  }),

  closeButton: (theme: any): ViewStyle => ({
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundMuted,
    justifyContent: "center",
    alignItems: "center",
  }),

  closeText: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.textDim,
    fontWeight: "600",
  }),

  body: (theme: any): ViewStyle => ({
    marginBottom: theme.spacing.lg,
  }),

  footer: (theme: any): ViewStyle => ({
    flexDirection: "row",
    gap: theme.spacing.sm,
  }),

  bottomSheet: {
    justifyContent: "flex-end",
    margin: 0,
  } as ViewStyle,

  bottomSheetContainer: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.spacing.lg,
    borderTopRightRadius: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    maxHeight: "80%",
  }),
}

// CHIP/TAG STYLES
export const chips = {
  base: (theme: any): ViewStyle => ({
    borderRadius: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
  }),

  selected: (theme: any): ViewStyle => ({
    ...chips.base(theme),
    backgroundColor: theme.colors.tint,
    borderColor: theme.colors.tint,
  }),

  unselected: (theme: any): ViewStyle => ({
    ...chips.base(theme),
    backgroundColor: theme.colors.backgroundMuted,
    borderColor: theme.colors.border,
  }),

  text: (theme: any): TextStyle => ({
    fontSize: 14,
    fontWeight: "500",
  }),

  textSelected: (theme: any): TextStyle => ({
    ...chips.text(theme),
    color: theme.colors.tintInverse,
  }),

  textUnselected: (theme: any): TextStyle => ({
    ...chips.text(theme),
    color: theme.colors.text,
  }),
}

// SEPARATOR STYLES
export const separators = {
  horizontal: (theme: any): ViewStyle => ({
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  }),

  vertical: (theme: any): ViewStyle => ({
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.sm,
  }),

  thick: (theme: any): ViewStyle => ({
    height: theme.spacing.xs,
    backgroundColor: theme.colors.backgroundMuted,
    marginVertical: theme.spacing.md,
  }),
}

// STATUS STYLES
export const status = {
  success: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.palette.primary100,
    borderColor: theme.colors.palette.primary500,
    borderWidth: 1,
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.sm,
  }),

  error: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.errorBackground,
    borderColor: theme.colors.error,
    borderWidth: 1,
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.sm,
  }),

  warning: (theme: any): ViewStyle => ({
    backgroundColor: "#FFF3CD",
    borderColor: "#FFC107",
    borderWidth: 1,
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.sm,
  }),

  info: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.backgroundMuted,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.sm,
  }),
}

// SHADOW STYLES
export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  } as ViewStyle,

  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,
}
