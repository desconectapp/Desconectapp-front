/**
 * These are configuration settings for the dev environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
import { Platform } from "react-native"

const isAndroid = Platform.OS === "android"

export default {
  API_URL: isAndroid ? "http://10.0.2.2:8080" : "http://localhost:8080",
}
