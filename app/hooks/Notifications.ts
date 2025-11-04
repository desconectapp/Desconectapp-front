import { useState, useEffect, useRef } from "react"
import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import Constants from "expo-constants"
import { Platform } from "react-native"
import { PushTokenService } from "../services/notifications/PushTokenService"

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken
  notification?: Notifications.Notification
}

export const usePushNotifications = (): PushNotificationState => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowAlert: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })

  const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>()

  const [notification, setNotification] = useState<Notifications.Notification | undefined>()

  const notificationListener =
    useRef<ReturnType<typeof Notifications.addNotificationReceivedListener>>()
  const responseListener =
    useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener>>()

  async function registerForPushNotificationsAsync() {
    let token
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification")
        return
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      })
    } else {
      alert("Must be using a physical device for Push notifications")
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      })
    }

    return token
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token)
        console.log("Push token obtained:", token.data)
        // Note: Not registering with backend since we're using frontend-only notifications
      }
    })

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response)
      // Handle notification tap - you can navigate to specific screens here
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  return {
    expoPushToken,
    notification,
  }
}
