import { useAppTheme } from "@/utils/useAppTheme"
import { containers, buttons, buttonTexts, texts, inputs, modals, chips, separators, status, shadows } from "./commonStyles"

/**
 * Hook to access all common themed styles
 * This provides easy access to consistent styling throughout the app
 * 
 * @example
 * const styles = useThemedStyles()
 * <View style={styles.containers.screen}>
 *   <Button style={styles.buttons.primary(theme)} />
 * </View>
 */
export const useThemedStyles = () => {
  const { theme, themed } = useAppTheme()
  
  return {
    // Direct theme access
    theme,
    themed,
    
    // Common styles that need theme
    containers: {
      screen: containers.screen,
      screenPadded: themed(containers.screenPadded),
      centered: containers.centered,
      row: containers.row,
      rowBetween: containers.rowBetween,
      column: containers.column,
      section: themed(containers.section),
      card: themed(containers.card),
    },
    
    buttons: {
      base: themed(buttons.base),
      primary: themed(buttons.primary),
      primaryDisabled: themed(buttons.primaryDisabled),
      secondary: themed(buttons.secondary),
      danger: themed(buttons.danger),
      link: buttons.link,
      floating: themed(buttons.floating),
    },
    
    buttonTexts: {
      primary: themed(buttonTexts.primary),
      primaryDisabled: themed(buttonTexts.primaryDisabled),
      secondary: themed(buttonTexts.secondary),
      danger: themed(buttonTexts.danger),
      link: themed(buttonTexts.link),
    },
    
    texts: {
      heading: themed(texts.heading),
      subheading: themed(texts.subheading),
      title: themed(texts.title),
      body: themed(texts.body),
      bodySmall: themed(texts.bodySmall),
      caption: themed(texts.caption),
      label: themed(texts.label),
      error: themed(texts.error),
      success: themed(texts.success),
      center: texts.center,
    },
    
    inputs: {
      base: themed(inputs.base),
      error: themed(inputs.error),
      focused: themed(inputs.focused),
      textArea: themed(inputs.textArea),
      text: themed(inputs.text),
      textAreaText: themed(inputs.textAreaText),
    },
    
    modals: {
      overlay: modals.overlay,
      container: themed(modals.container),
      header: themed(modals.header),
      title: themed(modals.title),
      closeButton: themed(modals.closeButton),
      closeText: themed(modals.closeText),
      body: themed(modals.body),
      footer: themed(modals.footer),
      bottomSheet: modals.bottomSheet,
      bottomSheetContainer: themed(modals.bottomSheetContainer),
    },
    
    chips: {
      base: themed(chips.base),
      selected: themed(chips.selected),
      unselected: themed(chips.unselected),
      text: themed(chips.text),
      textSelected: themed(chips.textSelected),
      textUnselected: themed(chips.textUnselected),
    },
    
    separators: {
      horizontal: themed(separators.horizontal),
      vertical: themed(separators.vertical),
      thick: themed(separators.thick),
    },
    
    status: {
      success: themed(status.success),
      error: themed(status.error),
      warning: themed(status.warning),
      info: themed(status.info),
    },
    
    shadows,
  }
}

/**
 * Quick access to common style combinations
 */
export const getQuickStyles = (theme: any) => ({
  // Common button combinations
  primaryButton: [buttons.primary(theme), shadows.small],
  secondaryButton: [buttons.secondary(theme), shadows.small],
  dangerButton: [buttons.danger(theme), shadows.small],
  
  // Common card styles
  elevatedCard: [containers.card(theme), shadows.medium],
  flatCard: containers.card(theme),
  
  // Common input combinations
  textInput: [inputs.base(theme), inputs.text(theme)],
  errorInput: [inputs.base(theme), inputs.error(theme), inputs.text(theme)],
  
  // Common text combinations
  screenTitle: [texts.heading(theme), texts.center],
  sectionTitle: texts.subheading(theme),
  formLabel: texts.label(theme),
  errorText: texts.error(theme),
  
  // Layout helpers
  spacedContainer: [containers.screen, { gap: theme.spacing.md }],
  centeredContent: [containers.centered, { padding: theme.spacing.lg }],
})
