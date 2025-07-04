import { types } from "mobx-state-tree"

export interface UserSession {
  email: string
  expiresAt: string
  refreshExpiresAt: string
  refreshToken: string
  token: string
}

export const SessionModel = types
  .model("SessionModel", {
    email: types.maybeNull(types.string),
    expiresAt: types.maybeNull(types.string),
    refreshExpiresAt: types.maybeNull(types.string),
    refreshToken: types.maybeNull(types.string),
    token: types.maybeNull(types.string),
  })
  .actions((store) => ({
    setSession(session: UserSession | null) {
      store.email = session?.email || null
      store.token = session?.token || null
      store.expiresAt = session?.expiresAt || null
      store.refreshToken = session?.refreshToken || null
      store.refreshExpiresAt = session?.refreshExpiresAt || null
    },
  }))
