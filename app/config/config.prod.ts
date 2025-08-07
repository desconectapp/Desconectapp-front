/**
 * These are configuration settings for the production environment.
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

// For production, you might want to use your actual backend URL
// But for development on physical devices, use your machine's IP
const getApiUrl = () => {
  if (isAndroid) {
    return isEmulator ? "http://10.0.2.2:8080" : "http://192.168.0.31:8080"
  }
  return "http://localhost:8080"
}

export default {
  API_URL: getApiUrl(),
}
