import { observer } from "mobx-react-lite"
import { useState } from "react"
import { TouchableOpacity, type ViewStyle, type TextStyle, Dimensions, View, StyleSheet } from "react-native"
import { Screen, Text, Button, TextField } from "@/components"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"
// import * as Clipboard from "expo-clipboard" // Original import commented out
import { useNavigation } from "@react-navigation/native"
import type { AppStackScreenProps } from "@/navigators"
import { userService } from "@/services/users"

const { width } = Dimensions.get("window")
const { height } = Dimensions.get("window") // Added height for the style definition

const Clipboard = null // Mocking Clipboard as it was null in the original code

export const ForgotPasswordScreen = observer(() => {
  const { themed } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const $topInsets = useSafeAreaInsetsStyle(["top"]) // Added for header style usage
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
        setErrorMessage("Error al enviar código de restablecimiento. El usuario no fue encontrado.")
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
    // @ts-ignore - Clipboard is mocked as null, so this call will likely fail in a real environment without the library
    const text = await Clipboard.getStringAsync()
    if (text) {
      setCode(text.trim().slice(0, codeLength).toUpperCase())
    }
  }

  const handleSubmitNewPassword = () => {
    if (!code || code.length !== codeLength) {
      setErrorMessage("Por favor ingresa el código de restablecimiento de 6 dígitos.")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.")
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
        setErrorMessage("Error al restablecer contraseña. Código inválido u otro error.")
      })
      .finally(() => setLoading(false))
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[styles.container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      <View style={[styles.header, themed(themedStyles.header), $topInsets]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 10 }}
        >
          <Text style={[styles.backButtonText, themed(themedStyles.backButtonText)]}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, themed(themedStyles.headerTitle)]}>Olvidé mi Contraseña</Text>

      </View>

      {/* NEW WRAPPER ADDED FOR CENTERING THE FORM CONTENT */}
      <View style={styles.formCenteringWrapper}> 
        {step === 1 && (
          <>
            <TextField
              value={email}
              onChangeText={setEmail}
              placeholder="example@mail.com"
              autoCapitalize="none"
              keyboardType="email-address"
              containerStyle={$inputFull}
            />
            
            <Text style={themed($subtitle)}>Ingresa tu email y te enviaremos un código de restablecimiento.</Text>
            
            <Button
              text="Enviar Código de Restablecimiento"
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
            <Text style={themed($subtitle)}>Ingresa el código que enviamos a tu email</Text>

            <TextField
              value={code}
              onChangeText={setCode}
              placeholder="Código de restablecimiento"
              autoCapitalize="characters"
              keyboardType="default"
              containerStyle={$inputFull}
            />

            <TouchableOpacity onPress={handlePaste} style={$pasteButton}>
              <Text style={themed($pasteText)}>Pegar Código</Text>
            </TouchableOpacity>

            <TextField
              value={newPassword}
              onChangeText={setNewPassword}
              label="Nueva Contraseña"
              placeholder="Nueva contraseña"
              secureTextEntry
              containerStyle={$inputFull}
            />

            <TextField
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              label="Confirmar Contraseña"
              placeholder="Reingresa la nueva contraseña"
              secureTextEntry
              containerStyle={$inputFull}
            />

            <Button
              text="Restablecer Contraseña"
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
      </View>
    </Screen>
  )
})

/*
 * Note: The existing styles ($container, $subtitle, etc.) are kept as they are 
 * outside the new StyleSheet.create block, as this is a common pattern in 
 * some React Native boilerplate structures. The new 'styles' object 
 * is used for 'header' and its children.
*/

/* ---------- Existing Styles ---------- */
const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  // Removed paddingTop: spacing.xl
  alignItems: "center",
}

const $screenBackground = (theme: any) => ({
  backgroundColor: theme.colors.background,
})

const $subtitle: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.md,
  fontSize: 14,
}

const $inputFull: ViewStyle = {
  marginBottom: spacing.lg,
  width: "100%",
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


/* ---------- Updated Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Ensures the scroll view content takes up full height
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    // Removed justifyContent: "center" here, as the header is also in this container
  } as ViewStyle,
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1, 
    justifyContent: "space-between",
    width: "100%", 
    // Make sure the header does not take up all the vertical space
    flexShrink: 0, 
  } as ViewStyle,
  
  // NEW STYLE FOR CENTERING
  formCenteringWrapper: {
    flex: 1, // Takes up remaining vertical space
    width: "100%",
    justifyContent: "center", // Centers content vertically
    alignItems: "center", // Centers content horizontally (TextFields are already 100%)
    paddingBottom: spacing.xxl * 2, // Retains some padding for scrolling bottom
  } as ViewStyle,

  backButton: { 
    paddingRight: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  headerTitle: {
    textAlign: "center",
    flex: 1,
  } as TextStyle,

  backButtonText: {
    fontSize: 24,
    fontWeight: "600",
  } as TextStyle,
  
  formContent: { // This style is now superseded by formCenteringWrapper
      paddingBottom: spacing.xxl * 2,
  } as ViewStyle,
})

const themedStyles = {
    container: (theme: any): ViewStyle => ({
        backgroundColor: theme.colors.background,
    }),

    header: (theme: any): ViewStyle => ({
        backgroundColor: theme.colors.background,
        borderBottomColor: theme.colors.border,
    }),

    headerTitle: (theme: any): TextStyle => ({
        fontSize: 18,
        fontWeight: "600",
        color: theme.colors.text,
        textAlign: "center",
        flex: 1,
    }),

    backButtonText: (theme: any): TextStyle => ({
        fontSize: 24,
        color: theme.colors.tint,
        fontWeight: "600",
    }),
    
    backButton: (_theme: any): ViewStyle => ({
    }),
}