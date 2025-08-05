export interface catFact {
  fact: string
  length: number
}

export interface UserResponse {
  id: number
  name: string
  email: string
}

export interface Preference {
  id: string
  label: string
  icon: string
}

export interface CreateProfileData {
  name: string
  age: number
  city: string
  gender: string
  current_situation: string
  preferences: string[]
}

export interface ProfileData {
  name: string
  image: string | null
  city: string
  gender: string
  current_situation: string
  preferences: string[]
}

export interface SessionData {
  token: string
  refresh_token: string
  expires_at: string
  refresh_expires_at: string
  user_id: string
}
