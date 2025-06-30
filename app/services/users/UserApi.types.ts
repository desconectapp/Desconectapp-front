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
  location: string
  gender: string
  workStatus: string
  preferences: string[]
}

export interface ProfileData {
  name: string
  image: string | null
  location: string
  gender: string
  workStatus: string
  preferences: string[]
}
