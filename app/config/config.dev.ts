/**
 * These are configuration settings for the dev environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
import { Platform } from "react-native"
import Constants from "expo-constants"

const isAndroid = Platform.OS === "android"

// Detect if running on physical device vs emulator
const isEmulator = Constants.isDevice === false

// For Android physical devices, use your machine's IP address
// For Android emulator, use 10.0.2.2 (emulator's localhost mapping)
// For iOS, use localhost
const getApiUrl = () => {
  if (isAndroid) {
    return isEmulator ? "http://10.0.2.2:8085" : "http://192.168.0.31:8085"
  }
  return "http://localhost:8085"
}

export default {
  API_URL: getApiUrl(),
}
