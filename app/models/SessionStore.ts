import { types } from "mobx-state-tree"

export interface UserSession {
  user_id: number
  expiresAt: string
  refreshExpiresAt: string
  refreshToken: string
  token: string
  supabase_token: string
  supabase_expires_at: string
}

export const SessionModel = types
  .model("SessionModel", {
    user_id: types.maybeNull(types.number),
    expiresAt: types.maybeNull(types.string),
    refreshExpiresAt: types.maybeNull(types.string),
    refreshToken: types.maybeNull(types.string),
    token: types.maybeNull(types.string),
    supabase_token: types.maybeNull(types.string),
    supabase_expires_at: types.maybeNull(types.Date),
  })
  .actions((store) => ({
    setSession(session: UserSession | null) {
      console.log("Setting session:", session)
      store.user_id = session?.user_id || null
      store.token = session?.token || null
      store.expiresAt = session?.expiresAt || null
      store.refreshToken = session?.refreshToken || null
      store.refreshExpiresAt = session?.refreshExpiresAt || null
      store.supabase_token = session?.supabase_token || null
      store.supabase_expires_at = session?.supabase_expires_at ? new Date(session.supabase_expires_at) : null
    },
    getSession: () => {
      return {
        user_id: store.user_id,
        token: store.token,
        expiresAt: store.expiresAt,
        refreshToken: store.refreshToken,
        refreshExpiresAt: store.refreshExpiresAt,
        supabase_token: store.supabase_token,
        supabase_expires_at: store.supabase_expires_at,
      }
    },
    setSupabaseSession: (supabase_token: string, supabase_expires_at: Date) => {
      store.supabase_token = supabase_token
      store.supabase_expires_at = supabase_expires_at
    }
  }))
