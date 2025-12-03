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
import { useStores } from "@/models"
import { userService } from "@/services/users"

const { width } = Dimensions.get("window")

const Clipboard = null

export const ValidateEmailScreen = observer(() => {
  const { themed } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()

  const [errorMessage, setErrorMessage] = useState<string>("")

  const codeLength = 6
  const [digits, setDigits] = useState<string[]>(Array(codeLength).fill(""))
  const inputsRef = useRef<(any | null)[]>([])

  const { sessionStore } = useStores()

  const handleChange = (value: string, index: number) => {
    setErrorMessage("")
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

    if (!sessionStore.user_id) {
      console.error("No user_id in sessionStore")
      return
    }

    userService
      .validateEmail(code, sessionStore.user_id)
      .then(() => {
        navigation.navigate("MoreInfoScreen")
      })
      .catch(() => {
        setErrorMessage("Código inválido. Por favor intenta de nuevo.")
        setDigits(Array(codeLength).fill(""))
        inputsRef.current[0]?.focus()
      })
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      <Text preset="heading" style={themed($title)}>
        Verifica tu Email
      </Text>
      <Text style={themed($subtitle)}>Te enviamos un email. Pega el código a continuación para validar.</Text>

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
        <Text style={themed($pasteText)}>Pegar Código</Text>
      </TouchableOpacity>

      <Text style={themed($errorMessage)}>{errorMessage}</Text>

      <Button
        text="Validar"
        onPress={handleSubmit}
        disabled={digits.join("").length !== codeLength}
        style={themed($validateButton)}
        textStyle={themed($validateButtonText)}
      />
    </Screen>
  )
})

const $errorMessage = (theme: any) => ({
  color: theme.colors.error,
  height: 20,
  marginBottom: spacing.sm,
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
