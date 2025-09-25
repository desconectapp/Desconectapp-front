import { observer } from "mobx-react-lite"
import { useState } from "react"
import { TouchableOpacity, type ViewStyle, type TextStyle, Dimensions } from "react-native"
import { Screen, Text, Button, TextField } from "@/components"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"
// import * as Clipboard from "expo-clipboard"
import { useNavigation } from "@react-navigation/native"
import type { AppStackScreenProps } from "@/navigators"
import { userService } from "@/services/users"

const { width } = Dimensions.get("window")

const Clipboard = null

export const ForgotPasswordScreen = observer(() => {
  const { themed } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()

  const [step, setStep] = useState<1 | 2>(1)

  const [loading, setLoading] = useState<boolean>(false)

  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState(0)

  const [errorMessage, setErrorMessage] = useState("")

  const handleRequestReset = () => {
    console.log("Request reset for:", email)

    setLoading(true)
    userService
      .forgotPassword(email)
      .then((userId: number) => {
        console.log("Reset code sent to:", email, userId)
        setUserId(userId)
        setStep(2)
      })
      .catch((e) => {
        console.log(e)
        setErrorMessage("Error sending reset code. User doesn't exist.")
      })
      .finally(() => setLoading(false))
  }

  const codeLength = 6
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [code, setCode] = useState("")

  const handlePaste = async () => {
    if (!Clipboard || !Clipboard.getStringAsync) {
      console.warn("Clipboard API not available")
      return
    }
    const text = await Clipboard.getStringAsync()
    if (text) {
      setCode(text.trim().slice(0, codeLength).toUpperCase())
    }
  }

  const handleSubmitNewPassword = () => {
    if (!code || code.length !== codeLength) {
      setErrorMessage("Please enter the 6-character reset code.")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return
    }

    console.log("Reset with:", { email, code, newPassword })
    setLoading(true)
    userService
      .resetPassword(code, newPassword, userId)
      .then(() => {
        navigation.navigate("LoginScreen")
      })
      .catch((e) => {
        setErrorMessage("Error sending reset code. User doesn't exist.")
      })
      .finally(() => setLoading(false))
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      <Text preset="heading" style={themed($title)}>
        Forgot Password
      </Text>

      {step === 1 && (
        <>
          <Text style={themed($subtitle)}>Enter your email and we’ll send you a reset code.</Text>
          <TextField
            value={email}
            onChangeText={setEmail}
            placeholder="example@mail.com"
            autoCapitalize="none"
            keyboardType="email-address"
            containerStyle={$inputFull}
          />
          <Button
            text="Send Reset Code"
            onPress={handleRequestReset}
            disabled={!email.includes("@") || loading}
            loading={loading}
            style={themed($validateButton)}
            textStyle={themed($validateButtonText)}
          />
          {errorMessage ? (
            <Text style={{ color: "red", marginTop: spacing.md }}>{errorMessage}</Text>
          ) : null}
        </>
      )}

      {step === 2 && (
        <>
          <Text style={themed($subtitle)}>Enter the code we sent to your email</Text>

          <TextField
            value={code}
            onChangeText={setCode}
            placeholder="Reset code"
            autoCapitalize="characters"
            keyboardType="default"
            containerStyle={$inputFull}
          />

          <TouchableOpacity onPress={handlePaste} style={$pasteButton}>
            <Text style={themed($pasteText)}>Paste Code</Text>
          </TouchableOpacity>

          <TextField
            value={newPassword}
            onChangeText={setNewPassword}
            label="New Password"
            placeholder="New password"
            secureTextEntry
            containerStyle={$inputFull}
          />

          <TextField
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            label="Confirm Password"
            placeholder="Re-enter new password"
            secureTextEntry
            containerStyle={$inputFull}
          />

          <Button
            text="Reset Password"
            onPress={handleSubmitNewPassword}
            disabled={code.length !== codeLength || newPassword.length < 6}
            loading={loading}
            style={themed($validateButton)}
            textStyle={themed($validateButtonText)}
          />
          {errorMessage ? (
            <Text style={{ color: "red", marginTop: spacing.md }}>{errorMessage}</Text>
          ) : null}
        </>
      )}
    </Screen>
  )
})

/* ---------- Styles ---------- */
const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  alignItems: "center",
}

const $screenBackground = (theme: any) => ({
  backgroundColor: theme.colors.background,
})

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

const $inputFull: ViewStyle = {
  marginBottom: spacing.lg,
  width: "100%",
}

const $inputsRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.lg,
  width: width * 0.8,
}

const $inputBox = (theme: any): ViewStyle => ({
  width: 45,
  height: 55,
  borderWidth: 1,
  borderRadius: spacing.sm,
  justifyContent: "center",
  alignItems: "center",
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.background,
})

const $inputText = (theme: any): TextStyle => ({
  fontSize: 20,
  fontWeight: "600",
  color: theme.colors.text,
})

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
