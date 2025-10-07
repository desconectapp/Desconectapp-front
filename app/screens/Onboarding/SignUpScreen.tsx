import { observer } from "mobx-react-lite"
import { useEffect, useState } from "react"
import { View, type ViewStyle, type TextStyle, type ImageStyle, Dimensions } from "react-native"
import { Screen, Text, AutoImage } from "@/components"
import type { AppStackScreenProps } from "../../navigators"
import { useSafeAreaInsetsStyle } from "../../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useForm } from "react-hook-form"
import { useSignUp } from "@/hooks/Users"
import { useNavigation } from "@react-navigation/native"
import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import logoImage from "../../../assets/images/desconectapp_icon.jpeg"
import { AuthForm } from "@/components/Custom/AuthForm"
import { useStores } from "@/models"

const { width } = Dimensions.get("window")

interface SignUpFormData {
  email: string
  password: string
}

export const SignUpScreen = observer(() => {
  const { themed } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const [loading, setLoading] = useState<boolean>(false)
  const signUp = useSignUp()
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()
  const { showToast } = useAppToast()

  const { sessionStore } = useStores()

  // useEffect(() => {
  //   console.log('use effect en SignUpScreen')
  //   if (sessionStore.expiresAt && new Date(sessionStore.expiresAt) > Date.now()) {
  //     console.log('redirigiendo a Main')
  //     navigation.navigate("Main", { screen: "Tabs" })
  //   }
  // }, [navigation])

  const form = useForm<SignUpFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const getErrorMessage = (error: any) => {
    const errorMessages = {
      invalid_credentials: "Oops! Those credentials don't match our records",
      network_error: "Connection hiccup! Check your internet and try again",
      server_error: "Our servers are taking a quick break. Try again in a moment",
      validation_error: "Please double-check your information",
      account_locked: "Account temporarily locked for security. Contact support",
      email_not_verified: "Please verify your email before logging in",
    }

    return errorMessages[error?.code] || "Unexpected Error. Try again later"
  }

  const onSubmit = (data: SignUpFormData) => {
    setLoading(true)
    console.log(data)

    signUp.mutateAsync(data, {
      onSuccess: (dataSuccess) => {
        setLoading(false)
        sessionStore.setSession({
          expiresAt: dataSuccess.expires_at,
          refreshExpiresAt: dataSuccess.refresh_expires_at,
          refreshToken: dataSuccess.refresh_token,
          token: dataSuccess.token,
          user_id: dataSuccess.user_id,
          user_uuid: dataSuccess.user_uuid,
        })

        navigation.navigate("ValidateEmailScreen")
      },
      onError: (error) => {
        setLoading(false)
        const friendlyMessage = getErrorMessage(error)
        showToast("Login Failed", friendlyMessage)
      },
    })
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      <View style={$logoContainer}>
        <AutoImage source={logoImage} style={$logo} resizeMode="contain" />
        <Text preset="heading" style={themed($welcomeText)}>
          Join DesconectApp
        </Text>
        <Text preset="subheading" style={themed($subtitleText)}>
          Create your Account
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
        submitText="Create Account"
        onSubmit={onSubmit}
        forgotPassword={true}
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
          onPress={() => navigation.navigate("LoginScreen")}
        >
          Already have an account? Log In
        </Text>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
}

const $logoContainer: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.md,
  paddingTop: spacing.sm,
}

const $subtitleText = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  textAlign: "center",
  opacity: 0.8,
})

const $logo: ImageStyle = {
  width: width * 0.6,
  height: width * 0.6,
  marginBottom: spacing.md,
}

const $screenBackground = (theme: any) => ({
  backgroundColor: theme.colors.background,
})

const $welcomeText = (theme: any): TextStyle => ({
  color: theme.colors.text,
  marginBottom: spacing.xs,
  textAlign: "center",
})