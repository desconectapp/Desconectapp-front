import { observer } from "mobx-react-lite"
import { useRef, useState } from "react"
import { View, TouchableOpacity, type ViewStyle, type TextStyle, Dimensions } from "react-native"
import { Screen, Text, Button, TextField } from "@/components"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"
// import * as Clipboard from "expo-clipboard"
import { useNavigation } from "@react-navigation/native"
import type { AppStackScreenProps } from "@/navigators"

const { width } = Dimensions.get("window")

const Clipboard = null

export const ValidateEmailScreen = observer(() => {
  const { themed } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()

  const codeLength = 6
  const [digits, setDigits] = useState<string[]>(Array(codeLength).fill(""))
  const inputsRef = useRef<(any | null)[]>([])

  const handleChange = (value: string, index: number) => {
    const newDigits = [...digits]
    newDigits[index] = value.slice(-1).toUpperCase()
    setDigits(newDigits)

    if (value && index < codeLength - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = async () => {
    if (!Clipboard || !Clipboard.getStringAsync) {
      console.warn("Clipboard API not available")
      return
    }
    const text = await Clipboard.getStringAsync()
    if (text) {
      const chars = text.trim().slice(0, codeLength).toUpperCase().split("")
      setDigits((prev) => prev.map((_, i) => chars[i] || ""))
    }
  }

  const handleSubmit = () => {
    const code = digits.join("")
    console.log("Validate with code:", code)
    // TODO: call backend validate endpoint
    navigation.navigate("Main", { screen: "Tabs" })
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      <Text preset="heading" style={themed($title)}>
        Verify your Email
      </Text>
      <Text style={themed($subtitle)}>We sent you an email. Paste the code below to validate.</Text>

      <View style={$inputsRow}>
        {Array.from({ length: codeLength }).map((_, idx) => (
          <TextField
            key={idx}
            ref={(ref) => (inputsRef.current[idx] = ref)}
            value={digits[idx]}
            onChangeText={(val) => handleChange(val, idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
            maxLength={1}
            autoCapitalize="characters"
            keyboardType="default"
            containerStyle={$inputContainer}
            style={$inputText}
          />
        ))}
      </View>

      <TouchableOpacity onPress={handlePaste} style={$pasteButton}>
        <Text style={themed($pasteText)}>Paste Code</Text>
      </TouchableOpacity>

      <Button
        text="Validate"
        onPress={handleSubmit}
        disabled={digits.join("").length !== codeLength}
        style={themed($validateButton)}
        textStyle={themed($validateButtonText)}
      />
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  alignItems: "center",
}

const $screenBackground = (theme: any) => ({
  backgroundColor: theme.colors.background,
})

const $inputsRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.lg,
  width: width * 0.8,
}

const $inputContainer: ViewStyle = {
  borderRadius: spacing.sm,
  width: 45,
  height: 55,
  marginHorizontal: 4,
  justifyContent: "center",
  alignItems: "center",
}

const $inputText: TextStyle = {
  fontSize: 20,
  textAlign: "center",
  padding: 0,
}

const $title: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: spacing.sm,
}

const $subtitle: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.xl,
  fontSize: 14,
}

const $inputBox: TextStyle = {
  borderWidth: 1,
  borderRadius: spacing.sm,
  fontSize: 20,
  width: 45,
  height: 55,
  marginHorizontal: 4,
}

const $pasteButton: ViewStyle = {
  marginBottom: spacing.lg,
}

const $pasteText: TextStyle = {
  fontSize: 14,
  fontWeight: "500",
}

const $validateButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  borderRadius: spacing.md,
  minHeight: 50,
  minWidth: width * 0.6,
  justifyContent: "center",
})

const $validateButtonText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontWeight: "600",
  fontSize: 16,
})
