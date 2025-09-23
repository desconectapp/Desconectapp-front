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
      now < tokenExpiresAt - 60) { // Refresh 1 minute before expiry
    return cachedClient
  }
  
  try {
    const payload = JSON.parse(atob(jwtToken.split('.')[1]))
    tokenExpiresAt = payload.exp
  } catch (error) {
    console.warn('Could not parse JWT token expiration:', error)
    tokenExpiresAt = now + 900 
  }
  
  // Create new client
  cachedClient = createClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false, // We'll handle token refresh manually
        persistSession: false,   // We'll manage sessions via our backend
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

// Function to clear the cached client (useful for logout)
export function clearSupabaseCache() {
  cachedClient = null
  cachedToken = null
  tokenExpiresAt = null
}

// For backward compatibility, export a default client (but it should not be used without a token)
export const supabase = createClient(
  SUPABASE_URL!,
  'dummy-key', // This should not be used - always use getSupabaseClient with JWT
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
)