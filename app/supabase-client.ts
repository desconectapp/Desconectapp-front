import { createClient, SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY

let cachedClient: SupabaseClient | null = null
let cachedToken: string | null = null
let tokenExpiresAt: number | null = null

export function getSupabaseClient(jwtToken: string): SupabaseClient {
  const now = Math.floor(Date.now() / 1000)
  
  if (cachedClient && 
      cachedToken === jwtToken && 
      tokenExpiresAt && 
      now < tokenExpiresAt - 60) { 
    return cachedClient
  }
  
  try {
    const payload = JSON.parse(atob(jwtToken.split('.')[1]))
    tokenExpiresAt = payload.exp
  } catch (error) {
    console.warn('Could not parse JWT token expiration:', error)
    tokenExpiresAt = now + 900 
  }
  
  cachedClient = createClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,  
      },
      global: {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      }
    }
  )
  
  cachedToken = jwtToken
  return cachedClient
}

export function clearSupabaseCache() {
  cachedClient = null
  cachedToken = null
  tokenExpiresAt = null
}

export const supabase = createClient(
  SUPABASE_URL!,
  'dummy-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
)