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

  setToken(data: SessionData | null) {
    if (!data) {
      this.token = null
      this.refreshToken = null
      this.tokenExpiration = null
      this.refreshTokenExpiration = null
      return
    }

    this.token = data.token || null
    this.tokenExpiration = data.expires_at ? new Date(data.expires_at) : null

    this.refreshToken = data.refresh_token || null
    this.refreshTokenExpiration = data.refresh_expires_at ? new Date(data.refresh_expires_at) : null
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
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
