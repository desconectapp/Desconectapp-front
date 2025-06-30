import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Text, Screen, Button, AutoImage } from "@/components"
import { isRTL } from "@/i18n"
import { AppStackScreenProps } from "../navigators"
import { $styles, type ThemedStyle } from "@/theme"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"

import { userService } from "../services/users"
import { useUsers } from "@/hooks/Users"

const welcomeLogo = require("../../assets/images/logo.png")
const welcomeFace = require("../../assets/images/welcome-face.png")

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen() {
  const { themed, theme } = useAppTheme()

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()

  const { data: users } = useUsers()

  return (
    <Screen preset="fixed" contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <AutoImage
          source={{
            uri: "https://media.tenor.com/o656qFKDzeUAAAAM/rick-astley-never-gonna-give-you-up.gif",
          }}
          maxWidth={200}
          maxHeight={100}
          resizeMode="contain"
          style={{}}
        />
        <Text>(Aca iria el logo xd)</Text>
      </View>

      <View style={styles.usersContainer}>
        {users?.map((user, index) => (
          <Text key={index} style={styles.userText}>
            {user.name} {user.email}
          </Text>
        ))}
      </View>

      <View style={styles.buttonsContainer}>
        <Button style={styles.button} onPress={() => navigation.navigate("LoginScreen")}>
          Ingresar
        </Button>
        <Button style={styles.button} onPress={() => navigation.navigate("SignUpScreen")}>
          Crear cuenta
        </Button>
        <Button style={styles.button} onPress={() => navigation.navigate("PreferencesScreen")}>
          Preferencias
        </Button>
      </View>
    </Screen>
  )
})

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: "space-between",
  } as ViewStyle,
  logoContainer: {
    alignItems: "center",
    justifyContent: "center", // para centrar verticalmente
    marginBottom: 40,
    height: 500, // espacio fijo para el logo
  } as ViewStyle,
  usersContainer: {
    flexGrow: 1,
    justifyContent: "center" as const,
    paddingHorizontal: 10,
  } as ViewStyle,
  buttonsContainer: {
    marginBottom: 20,
  } as ViewStyle,
  button: {
    marginVertical: 8,
  } as ViewStyle,
  userText: {
    marginVertical: 8,
    textAlign: "center" as const,
  } as TextStyle,
}
