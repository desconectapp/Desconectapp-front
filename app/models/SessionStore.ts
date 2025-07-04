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
    email: types.string,
    expiresAt: types.string,
    refreshExpiresAt: types.string,
    refreshToken: types.string,
    token: types.string,
  })
  .actions((store) => ({
    setSession(session: UserSession) {
      store.email = session.email
      store.token = session.token
      store.expiresAt = session.expiresAt
      store.refreshToken = session.refreshToken
      store.refreshExpiresAt = session.refreshExpiresAt
    },
  }))
