import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Text, Screen, Header, TextField, Button } from "@/components"
import { isRTL } from "@/i18n"
import { AppStackScreenProps } from "../navigators"
import { $styles, type ThemedStyle } from "@/theme"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useForm } from "react-hook-form"

import { userService } from "../services/users"
import { useSignUp, useUsers } from "@/hooks/Users"
import { useNavigation } from "@react-navigation/native"



// interface SignUpScreenProps extends AppStackScreenProps<> {}
export const SignUpScreen = observer(function SignUpScreen() {
  const { themed } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  const signUpFunc = useSignUp()
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()

  const { register, handleSubmit, setValue } = useForm()

  useEffect(() => {
    register("name")
    register("email")
    register("password")
  }, [register])

  const onSubmit = (data: any) => {
    console.log(data)
    signUpFunc.mutateAsync(data, {
      onSuccess: () => {
        console.log("Usuario creado exitosamente")
        navigation.navigate("Welcome")
      },
      onError: (error) => {
        console.error("Error al crear usuario:", error)
      },
    })
  }

  return (
    <Screen preset="scroll" contentContainerStyle={[$container, $bottomContainerInsets]}>
      <Header title="Crear cuenta" />

      <TextField
        label="Nombre"
        placeholder="Tu nombre"
        onChangeText={(text) => setValue("name", text)}
        containerStyle={$field}
      />

      <TextField
        label="Email"
        placeholder="tucorreo@ejemplo.com"
        onChangeText={(text) => setValue("email", text)}
        keyboardType="email-address"
        containerStyle={$field}
      />

      <TextField
        label="Contraseña"
        placeholder="••••••••"
        onChangeText={(text) => setValue("password", text)}
        secureTextEntry
        containerStyle={$field}
      />

      <Button text="Registrarse" onPress={handleSubmit(onSubmit)} style={$button} />
    </Screen>
  )
})


const $container = { padding: 20 }
const $field = { marginBottom: 16 }
const $button = { marginTop: 24 }

const $topContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $bottomContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "43%",
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
  justifyContent: "space-around",
})

const $welcomeLogo: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
})

const $welcomeFace: ImageStyle = {
  height: 169,
  width: 269,
  position: "absolute",
  bottom: -47,
  right: -80,
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $welcomeHeading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})
