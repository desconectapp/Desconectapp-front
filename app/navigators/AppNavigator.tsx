// AppNavigator.tsx
import { NavigationContainer, NavigatorScreenParams } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import * as Screens from "@/screens"
import Config from "../config"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { useAppTheme, useThemeProvider } from "@/utils/useAppTheme"
import { ComponentProps } from "react"
import { MainNavigator, MainStackParamList } from "./MainNavigator"

export type AppStackParamList = {
  Welcome: undefined
  SignUpScreen: undefined
  LoginScreen: undefined
  MoreInfoScreen: undefined
  ValidateEmailScreen: undefined
  ForgotPasswordScreen: undefined
  Main: NavigatorScreenParams<MainStackParamList>
}

const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = observer(function AppStack() {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: { backgroundColor: colors.background, paddingTop: 20 },
      }}
    >
      {/* Onboarding sin navbar */}
      {/* <Stack.Screen name="Welcome" component={Screens.WelcomeScreen} /> */}
      <Stack.Screen name="SignUpScreen" component={Screens.SignUpScreen} />
      <Stack.Screen name="MoreInfoScreen" component={Screens.MoreInfoScreen} />
      <Stack.Screen name="ValidateEmailScreen" component={Screens.ValidateEmailScreen} />
      <Stack.Screen name="ForgotPasswordScreen" component={Screens.ForgotPasswordScreen} />
      <Stack.Screen name="LoginScreen" component={Screens.LoginScreen} />

      {/* Main con navbar */}
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  )
})

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const { themeScheme, navigationTheme, setThemeContextOverride, ThemeProvider } =
    useThemeProvider()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <ThemeProvider value={{ themeScheme, setThemeContextOverride }}>
      <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
        <Screens.ErrorBoundary catchErrors={Config.catchErrors}>
          <AppStack />
        </Screens.ErrorBoundary>
      </NavigationContainer>
    </ThemeProvider>
  )
})
