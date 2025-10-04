/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import type { ApiConfig } from "./api.types"
import { SessionData } from "../users/UserApi.types"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig
  token: string | null = null
  tokenExpiration: Date | null = null
  refreshToken: string | null = null
  refreshTokenExpiration: Date | null = null

  callbackToken: ((data: SessionData | null) => void) | null = null

  setToken(data: SessionData | null) {
    if (this.callbackToken) {
      this.callbackToken(data)
    }

    if (!data) {
      this.token = null
      this.refreshToken = null
      this.tokenExpiration = null
      this.refreshTokenExpiration = null
      // Clear Supabase cache when logging out
      import("../chat").then(({ chatsService }) => {
        chatsService.clearSupabaseCache()
      })
      return
    }

    this.token = data.token || null
    this.tokenExpiration = data.expires_at ? new Date(data.expires_at) : null

    this.refreshToken = data.refresh_token || null
    this.refreshTokenExpiration = data.refresh_expires_at ? new Date(data.refresh_expires_at) : null
  }

  setCallbackRefreshSession(callback: (data: SessionData | null) => void) {
    this.callbackToken = callback
  }

  async refreshSession() {
    if (!this.refreshToken || !this.refreshTokenExpiration) {
      console.warn("API: No valid refresh token available, cannot refresh session.")
      this.setToken(null)
      return
    }

    const res = await this.apisauce.post("/auth/refresh", {
      refresh_token: this.refreshToken,
    })

    if (res.ok && res.data) {
      const data: SessionData = res.data as SessionData
      this.setToken(data)
    } else {
      console.error("API: Error refreshing session", res.problem, res.status, res.data)
      this.setToken(null)
    }
  }

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config

    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })

    this.apisauce.addRequestTransform((request) => {
      if (this.token && request.headers) {
        request.headers["Authorization"] = `Bearer ${this.token}`
      }
    })

    this.apisauce.addResponseTransform((response) => {
      if (response.status === 401) {
        this.refreshSession()
      }
    })
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
