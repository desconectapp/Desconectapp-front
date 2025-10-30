import { api } from "../api"

export interface PushTokenRequest {
  token: string
  platform: "ios" | "android"
}

export interface PushTokenResponse {
  success: boolean
  message?: string
}

export const PushTokenService = {
  /**
   * Register a push token with the backend
   */
  async registerToken(tokenData: PushTokenRequest): Promise<PushTokenResponse> {
    try {
      const response = await api.post("/push-tokens", tokenData)
      return response.data
    } catch (error) {
      console.error("Failed to register push token:", error)
      throw error
    }
  },

  /**
   * Unregister a push token from the backend
   */
  async unregisterToken(token: string): Promise<PushTokenResponse> {
    try {
      const response = await api.delete(`/push-tokens/${token}`)
      return response.data
    } catch (error) {
      console.error("Failed to unregister push token:", error)
      throw error
    }
  },
}
