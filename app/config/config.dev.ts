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

// Get IP and port from environment variables
const API_IP = process.env.EXPO_PUBLIC_API_IP 
const API_PORT = process.env.EXPO_PUBLIC_API_PORT 
// For Android physical devices, use your machine's IP address
// For Android emulator, use 10.0.2.2 (emulator's localhost mapping)
// For iOS, use localhost
const getApiUrl = () => {
  if (isAndroid) {
    return isEmulator ? `http://10.0.2.2:${API_PORT}` : `http://${API_IP}:${API_PORT}`
  }
  return `http://localhost:${API_PORT}`
}

export default {
  API_URL: getApiUrl(),
}
