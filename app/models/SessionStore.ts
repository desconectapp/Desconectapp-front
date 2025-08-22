import { types } from "mobx-state-tree"

export interface UserSession {
  user_id: string
  expiresAt: string
  refreshExpiresAt: string
  refreshToken: string
  token: string
}

export const SessionModel = types
  .model("SessionModel", {
    user_id: types.maybeNull(types.string),
    expiresAt: types.maybeNull(types.string),
    refreshExpiresAt: types.maybeNull(types.string),
    refreshToken: types.maybeNull(types.string),
    token: types.maybeNull(types.string),
  })
  .actions((store) => ({
    setSession(session: UserSession | null) {
      console.log("Setting session:", session)
      store.user_id = session?.user_id || null
      store.token = session?.token || null
      store.expiresAt = session?.expiresAt || null
      store.refreshToken = session?.refreshToken || null
      store.refreshExpiresAt = session?.refreshExpiresAt || null
    },
  }))
