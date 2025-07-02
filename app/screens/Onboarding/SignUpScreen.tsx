import { observer } from "mobx-react-lite"
import { useState } from "react"
import { View, type ViewStyle, type TextStyle, type ImageStyle, Dimensions } from "react-native"
import { Screen, TextField, Button, Text, AutoImage } from "@/components"
import type { AppStackScreenProps } from "../../navigators"
import { useSafeAreaInsetsStyle } from "../../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useForm } from "react-hook-form"
import { useLogin, useSignUp } from "@/hooks/Users"
import { useNavigation } from "@react-navigation/native"
import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import logoImage from "../../../assets/images/logo.png"

const { width } = Dimensions.get("window")

interface SignUpFormData {
  email: string
  password: string
}

export const SignUpScreen = observer(function LoginScreen() {
  const { themed } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const [buttonState, setButtonState] = useState<boolean>(false)
  const signUp = useSignUp()
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()
  const { showToast } = useAppToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: "user@example.com",
      password: "123456",
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

    return errorMessages[error?.code as keyof typeof errorMessages] || "Unexpected Error. Try again later"
  }

  const onSubmit = (data: SignUpFormData) => {
    setButtonState(true)
    console.log(data)

    signUp.mutateAsync(data, {
      onSuccess: (response) => {
        setButtonState(false)
        navigation.navigate("MoreInfoScreen")
      },
      onError: (error) => {
        setButtonState(false)
        const friendlyMessage = getErrorMessage(error)
        showToast("Login Failed", friendlyMessage)
      },
    })
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground).backgroundColor}
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
      <View style={$formContainer}>
        <TextField
          label="Email"
          placeholder="Enter your email"
          {...register("email", {
            required: "We need your email to sign you in",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address",
            },
          })}
          onChangeText={(text) => setValue("email", text)}
          value={watch("email")}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          helper={errors.email?.message}
          status={errors.email ? "error" : undefined}
          containerStyle={$fieldContainer}
        />

        <TextField
          label="Password"
          placeholder="Enter your password"
          {...register("password", {
            required: "Password is required to access your account",
            minLength: {
              value: 6,
              message: "Password should be at least 6 characters long",
            },
          })}
          value={watch("password")}
          onChangeText={(text) => setValue("password", text)}
          secureTextEntry
          autoComplete="password"
          helper={errors.password?.message}
          status={errors.password ? "error" : undefined}
          containerStyle={$fieldContainer}
        />

        <View style={$forgotPasswordContainer}>
          <Text
            preset="formHelper"
            style={themed($forgotPasswordText)}
            onPress={() => {
              showToast("Coming Soon", "WORK IN PROGRESS XD")
            }}
          >
            Forgot your password?
          </Text>
        </View>

        <Button
          text={buttonState ? "Signing Up..." : "Sign Up"}
          onPress={handleSubmit(onSubmit)}
          style={themed($loginButton)}
          textStyle={themed($loginButtonText)}
          loading={buttonState}
          disabled={buttonState}
        />

        <View style={$signUpContainer}>
          <Text preset="formHelper" style={themed($signUpText)}>
            Already have an account?{" "}
            <Text
              preset="formHelper"
              style={themed($signUpLink)}
              onPress={() => {
                navigation.navigate("LoginScreen")
              }}
            >
              Log In
            </Text>
          </Text>
        </View>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
}

const $screenBackground = (theme: any) => ({
  backgroundColor: theme.colors.background,
})

const $logoContainer: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.xxl,
  paddingTop: spacing.xl,
}

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

const $subtitleText = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  textAlign: "center",
  opacity: 0.8,
})

const $formContainer: ViewStyle = {
  flex: 1,
}

const $fieldContainer: ViewStyle = {
  marginBottom: spacing.md,
}

const $forgotPasswordContainer: ViewStyle = {
  alignItems: "flex-end",
  marginBottom: spacing.lg,
  marginTop: -spacing.xs,
}

const $forgotPasswordText = (theme: any): TextStyle => ({
  color: theme.colors.tint,
  textDecorationLine: "underline",
})

const $loginButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  borderRadius: spacing.md,
  marginBottom: spacing.lg,
  minHeight: 56,
  shadowColor: theme.colors.tint,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
})

const $loginButtonText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontWeight: "600",
  fontSize: 16,
})

const $signUpContainer: ViewStyle = {
  alignItems: "center",
  paddingTop: spacing.md,
}

const $signUpText = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  textAlign: "center",
})

const $signUpLink = (theme: any): TextStyle => ({
  color: theme.colors.tint,
  fontWeight: "600",
  textDecorationLine: "underline",
})
