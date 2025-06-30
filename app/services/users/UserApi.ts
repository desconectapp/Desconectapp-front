import { api } from "../api"
import { CreateProfileData, Preference, ProfileData, UserResponse } from "./UserApi.types"

export const userService = {
  getUsers: async (): Promise<UserResponse[] | undefined> => {
    const response = await api.apisauce.get<UserResponse[]>("/users")
    if (!response.ok) {
      throw new Error("Error al cargar usuarios")
    }
    console.log("Usuarios obtenidos:", response.data)
    return response.data
  },

  signUp: async (data: { name: string; email: string; password: string }): Promise<void> => {
    const response = await api.apisauce.post<void>("/users", data)
    if (!response.ok) {
      throw new Error("Error al crear usuario")
    }
    console.log("Usuario creado:", response.data)
    return response.data
  },

  createProfile: async (data: CreateProfileData): Promise<void> => {
    console.log("Creando perfil con datos:", data)
    const response = await api.apisauce.post<void>("/users/profile", data)
    if (!response.ok) {
      throw new Error("Error al crear perfil")
    }
    console.log("Perfil creado:", response.data)
    return response.data
  },

  getProfile: async (): Promise<ProfileData | undefined> => {
    const response = await api.apisauce.get<void>("/users/profile")
    if (!response.ok) {
      throw new Error("Error al obtener perfil")
    }
    return response.data
  },

  getPreferences: async (): Promise<Preference[] | undefined> => {
    // const response = await api.apisauce.get<string[]>("/users/preferences")
    // if (!response.ok) {
    //   throw new Error("Error al cargar preferencias")
    // }
    // console.log("Preferencias obtenidas:", response.data)
    // return response.data

    // dejo mockeado
    return [
      { id: "chess", label: "Chess", icon: "♟️" },
      { id: "football", label: "Football", icon: "⚽" },
      { id: "basketball", label: "Basketball", icon: "🏀" },
      { id: "tennis", label: "Tennis", icon: "🎾" },
      { id: "swimming", label: "Swimming", icon: "🏊" },
      { id: "running", label: "Running", icon: "🏃" },
      { id: "cycling", label: "Cycling", icon: "🚴" },
      { id: "yoga", label: "Yoga", icon: "🧘" },
      { id: "hiking", label: "Hiking", icon: "🥾" },
      { id: "dancing", label: "Dancing", icon: "💃" },
      { id: "music", label: "Music", icon: "🎵" },
      { id: "reading", label: "Reading", icon: "📚" },
      { id: "cooking", label: "Cooking", icon: "👨‍🍳" },
      { id: "photography", label: "Photography", icon: "📸" },
      { id: "gaming", label: "Gaming", icon: "🎮" },
      { id: "travel", label: "Travel", icon: "✈️" },
      { id: "art", label: "Art", icon: "🎨" },
    ]
  },

  login: async (data: { email: string; password: string }): Promise<void> => {
    const response = await api.apisauce.post<void>("/users/login", data)
    if (!response.ok) {
      throw new Error("Error al iniciar sesión")
    }
    console.log("Usuario autenticado:", response.data)
    return response.data
  },
}
