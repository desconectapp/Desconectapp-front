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
import { Dimensions, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { spacing } from "@/theme"
import logoImage from "../../../assets/images/logo.png"
import { useStores } from "@/models"

const { width } = Dimensions.get("window")

export const LoginScreen = observer(() => {
  const { themed } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const [loading, setLoading] = useState<boolean>(false)

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
        // navigation.navigate("Main", { screen: "Tabs" })
        navigation.navigate("ValidateEmailScreen")
      },
      onError: () => {
        setLoading(false)
        showToast("Error al iniciar sesion", "Por favor, intenta nuevamente.")
      },
    })
  }
  return (
    <Screen preset="scroll" contentContainerStyle={[$container, $bottomContainerInsets]}>
      <View style={$logoContainer}>
        <AutoImage source={logoImage} style={$logo} resizeMode="contain" />
        <Text preset="heading" style={themed($welcomeText)}>
          Welcome Back
        </Text>
        <Text preset="subheading" style={themed($subtitleText)}>
          Enter your credentials to continue
        </Text>
      </View>
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
          },
        ]}
        submitText="Login"
        onSubmit={onSubmit}
        forgotPassword={false}
        isSubmitting={loading}
      />
      <View style={$logoContainer}>
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
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
}

const $logoContainer: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.xxl,
  paddingTop: spacing.xl,
}

const $subtitleText = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  textAlign: "center",
  opacity: 0.8,
})

const $logo: ImageStyle = {
  width: width * 0.3,
  height: width * 0.3,
  marginBottom: spacing.md,
}

const $welcomeText = (theme: any): TextStyle => ({
  color: theme.colors.text,
  marginBottom: spacing.xs,
  textAlign: "center",
})
