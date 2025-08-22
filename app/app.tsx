/* eslint-disable import "./utils/gestureHandler"
import { initI18n } from "./i18n"
import { useFonts } from "expo-font"
import { useEffect, useState } from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import * as Linking from "expo-linking"
import * as SplashScreen from "expo-splash-screen"
import { RootStoreProvider, useInitialRootStore } from "./models"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import * as storage from "./utils/storage"
import { customFontsToLoad } from "./theme"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { loadDateFnsLocale } from "./utils/formatDate"
import { GestureHandlerRootView } from "react-native-gesture-handler"*/
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
import "./utils/gestureHandler"
import { initI18n } from "./i18n"
import { useFonts } from "expo-font"
import { useEffect, useState } from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import * as Linking from "expo-linking"
import * as SplashScreen from "expo-splash-screen"
import { RootStoreProvider, UserSession, useInitialRootStore, useStores } from "./models"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import * as storage from "./utils/storage"
import { customFontsToLoad } from "./theme"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { loadDateFnsLocale } from "./utils/formatDate"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createTamagui, TamaguiProvider, View } from "tamagui"
import { defaultConfig } from "@tamagui/config/v4" // for quick config install this

import { AppToast, ToastRoot } from "./components/Toast"
import { ToastControls } from "./components/ToastControls"
import { YStack } from "tamagui"
import { ToastProvider, ToastViewport } from "@tamagui/toast"
import { api } from "./services/api"
import { SessionData } from "./services/users"
if (__DEV__) {
  // Load Reactotron in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require("./devtools/ReactotronConfig.ts")
}

const tamaguiConfig = createTamagui(defaultConfig)

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// Web linking configuration
const prefix = Linking.createURL("/")
const config = {
  screens: {
    Login: {
      path: "",
    },
    Welcome: "welcome",
    Demo: {
      screens: {
        DemoShowroom: {
          path: "showroom/:queryIndex?/:itemIndex?",
        },
        DemoDebug: "debug",
        DemoPodcastList: "podcast",
        DemoCommunity: "community",
      },
    },
  },
}

/**
 * This is the root component of our app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */

const queryClient = new QueryClient()

export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  const [refreshSavedToken, setRefreshSavedToken] = useState(0)

  const { sessionStore } = useStores()

  const { rootStore, rehydrated } = useInitialRootStore(() => {
    // This runs after the root store has been initialized and rehydrated.
    const s = rootStore.sessionStore
    if (!s.token || !s.expiresAt || !s.refreshExpiresAt || !s.refreshToken) {
      api.setToken(null)
    } else {
      api.setToken({
        token: s.token,
        expires_at: s.expiresAt,
        refresh_token: s.refreshToken,
        refresh_expires_at: s.refreshExpiresAt,
        user_id: "",
      })
    }

    function callbackRefreshToken(s: SessionData | null) {
      sessionStore.setSession({
        email: s?.email,
        token: s?.token,
        expiresAt: s?.expires_at,
        refreshToken: s?.refresh_token,
        refreshExpiresAt: s?.refresh_expires_at,
      })
    }

    api.setCallbackRefreshSession(callbackRefreshToken)

    // If your initialization scripts run very fast, it's good to show the splash screen for just a bit longer to prevent flicker.
    // Slightly delaying splash screen hiding for better UX; can be customized or removed as needed,
    setTimeout(SplashScreen.hideAsync, 500)
  })

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (
    !rehydrated ||
    !isNavigationStateRestored ||
    !isI18nInitialized ||
    (!areFontsLoaded && !fontLoadError)
  ) {
    return null
  }

  const linking = {
    prefixes: [prefix],
    config,
  }

  // otherwise, we're ready to render the app
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig}>
        <ToastProvider>
          <YStack flex={1}>
            <QueryClientProvider client={queryClient}>
              <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                <KeyboardProvider>
                  <RootStoreProvider value={rootStore}>
                    <AppNavigator
                      linking={linking}
                      initialState={initialNavigationState}
                      onStateChange={onNavigationStateChange}
                    />
                  </RootStoreProvider>
                </KeyboardProvider>
              </SafeAreaProvider>
            </QueryClientProvider>

            <ToastViewport bottom={0} left={0} right={0} />
            <AppToast />
          </YStack>
        </ToastProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  )
}
