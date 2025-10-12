import { observer } from "mobx-react-lite"
import { useEffect, useState } from "react"
import { Screen, Text, AutoImage } from "@/components"
import { AppStackScreenProps } from "../../navigators"
import { useSafeAreaInsetsStyle } from "../../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useForm } from "react-hook-form"

import { useLogin } from "@/hooks/Users"
import { useNavigation } from "@react-navigation/native"
import { useAppToast } from "@/components/useToast"
import { AuthForm } from "@/components/Custom/AuthForm"
import {
  Dimensions,
  ImageStyle,
  TextStyle,
  View,
  ViewStyle,
  TextInput,
  TouchableOpacity,
} from "react-native"
import { spacing } from "@/theme"
import logoImage from "../../../assets/images/desconectapp_icon.png"
import { useStores } from "@/models"
import { FontAwesome } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

export const LoginScreen = observer(() => {
  const { themed, theme } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)

  const LoginFunc = useLogin()
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()
  const { showToast } = useAppToast()
  const { sessionStore } = useStores()

  useEffect(() => {
    if (!sessionStore.token) {
      navigation.navigate("LoginScreen")
    } else {
      navigation.navigate("Main", { screen: "Tabs" })
    }
  }, [navigation, sessionStore.token])

  const form = useForm({
    defaultValues: {
      email: "martina@example.com",
      password: "password123",
    },
  })

  const onSubmit = (response: any) => {
    setLoading(true)
    LoginFunc.mutateAsync(response, {
      onSuccess: (_) => {
        setLoading(false)
        navigation.navigate("Main", { screen: "Tabs" })
      },
      onError: () => {
        setLoading(false)
        showToast("Error al iniciar sesión", "Por favor, intenta nuevamente.")
      },
    })
  }

  return (
    <Screen preset="scroll" contentContainerStyle={[$container, $bottomContainerInsets]}>
      <View style={$logoContainer}>
        <AutoImage source={logoImage} style={$logo} resizeMode="contain" />
        <Text preset="heading" style={themed($welcomeText)}>
          Conecta con lo que te gusta
        </Text>
        <Text preset="subheading" style={themed($subtitleText)}>
          Enter your credentials to continue
        </Text>
      </View>

      {/* 👇 AuthForm with password toggle */}
      <AuthForm
        form={form}
        fields={[
          {
            name: "email",
            label: "Email",
            placeholder: "example@mail.com",
            rules: {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email",
              },
            },
          },
          {
            name: "password",
            label: "Password",
            placeholder: "••••••••",
            rules: { required: "Password is required" },
            render: ({ value, onChange }) => (
              <View style={$passwordContainer}>
                <TextInput
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  onChangeText={onChange}
                  value={value}
                  style={themed($passwordInput)}
                  placeholderTextColor={theme.colors.textDim}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={$eyeButton}>
                  <FontAwesome
                    name={showPassword ? "eye" : "eye-slash"}
                    size={20}
                    color={theme.colors.textDim}
                  />
                </TouchableOpacity>
              </View>
            ),
          },
        ]}
        submitText="Login"
        onSubmit={onSubmit}
        forgotPassword={false}
        isSubmitting={loading}
      />

      <View>
        <Text
          preset="subheading"
          style={themed({
            color: "gray",
            textAlign: "center",
            opacity: 0.9,
          })}
          onPress={() => navigation.navigate("SignUpScreen")}
        >
          Don&apos;t have an account? Sign Up
        </Text>
      </View>

      <View>
        <Text
          preset="subheading"
          style={themed({
            color: "gray",
            textAlign: "center",
            opacity: 0.9,
          })}
          onPress={() => navigation.navigate("ForgotPasswordScreen")}
        >
          Forgot your password? Reset
        </Text>
      </View>
    </Screen>
  )
})

/* ---------- STYLES ---------- */

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
}

const $logoContainer: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.md,
  paddingTop: spacing.sm,
}

const $logo: ImageStyle = {
  width: width * 0.6,
  height: width * 0.6,
  marginBottom: spacing.md,
}

const $subtitleText = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  textAlign: "center",
  opacity: 0.8,
})

const $welcomeText = (theme: any): TextStyle => ({
  color: theme.colors.text,
  marginBottom: spacing.xs,
  textAlign: "center",
})

const $passwordContainer: ViewStyle = {
  position: "relative",
}

const $passwordInput = (theme: any): TextStyle => ({
  borderWidth: 1,
  borderColor: theme.colors.border ?? "#ccc",
  borderRadius: 8,
  padding: 12,
  paddingRight: 40,
  color: theme.colors.text,
})

const $eyeButton: ViewStyle = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: [{ translateY: -12 }], 
  padding: 4,
}
