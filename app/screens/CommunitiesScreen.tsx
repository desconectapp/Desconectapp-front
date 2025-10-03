import { observer } from "mobx-react-lite"
import { View ,Image, StyleSheet, TextStyle } from "react-native"
import { Screen, Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"

export const CommunitiesScreen = observer(function CommunitiesScreen() {
  const { themed, theme } = useAppTheme()
  const $insets = useSafeAreaInsetsStyle(["top", "bottom"])

  return (
    <Screen
    preset="fixed"
    style={[themed(styles.container), $insets]}
    safeAreaEdges={["top", "bottom"]}
    >
    <View style={styles.content}>
        <Image
        source={require("../../assets/images/desconectapp_pagelogo.jpeg")}
        style={styles.image}
        resizeMode="contain"
        />

        <Text style={titleStyle(theme)}>🚧 In Construction</Text>
        <Text style={subtitleStyle(theme)}>
        This feature is not ready yet. Check back soon!
        </Text>
    </View>
    </Screen>
)
})


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  image: {
    width: 460,
    height: 460,
    marginBottom: spacing.lg,
  },
})

const titleStyle = (theme: any): TextStyle => ({
  fontSize: 24,
  fontWeight: "700",
  color: theme.colors.text,
  marginTop: spacing.lg,
  marginBottom: spacing.sm,
})

const subtitleStyle = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.textDim,
  textAlign: "center",
  lineHeight: 22,
})