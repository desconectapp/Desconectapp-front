import { api } from "../api"
import {
  CreateProfileData,
  Preference,
  ProfileData,
  SessionData,
  UserResponse,
} from "./UserApi.types"

export const userService = {
  getUsers: async (): Promise<UserResponse[] | undefined> => {
    const response = await api.apisauce.get<UserResponse[]>("/users")
    if (!response.ok) {
      throw new Error("Error al cargar usuarios")
    }
    console.log("Usuarios obtenidos:", response.data)
    return response.data
  },

  signUp: async (data: {
    name: string
    email: string
    password: string
  }): Promise<SessionData | undefined> => {
    const response = await api.apisauce.post<SessionData>("/auth/signup", data)
    if (!response.ok) {
      throw new Error("Error al crear usuario")
    }
    api.setToken(response.data || null)
    return response.data
  },

  login: async (data: { email: string; password: string }): Promise<SessionData | undefined> => {
    const response = await api.apisauce.post<SessionData>("/auth/login", data)
    if (!response.ok) {
      console.log(response.data)
      throw new Error("Error al iniciar sesión")
    }
    api.setToken(response.data || null)
    console.log("API:LOGIN: Sesión iniciada:", response.data)
    return response.data
  },

  logout: async (): Promise<void> => {
    const response = await api.apisauce.post<void>("/auth/logout")
    if (!response.ok) {
      throw new Error("Error al cerrar sesión")
    }
    api.setToken(null)
    return response.data
  },

  createProfile: async (data: CreateProfileData): Promise<void> => {
    console.log("Creando perfil con datos:", data)
    const response = await api.apisauce.post<void>("/users/1/profile", data)
    if (!response.ok) {
      throw new Error("Error al crear perfil")
    }
    console.log("Perfil creado:", response.data)
    return response.data
  },

  getProfile: async (): Promise<ProfileData | undefined> => {
    // const response = await api.apisauce.get<void>("/users/profile")
    // if (!response.ok) {
    //   throw new Error("Error al obtener perfil")
    // }
    // return response.data

    return {
      name: "Lionel Messi",
      image: null,
      city: "Miami, FL",
      gender: "",
      current_situation: "Employed",
      preferences: ["chess", "football", "basketball"],
    }
  },

  editProfile: async (data: ProfileData): Promise<void> => {
    const response = await api.apisauce.put<void>("/users/profile", data)
    if (!response.ok) {
      throw new Error("Error al editar perfil")
    }
    return response.data
  },

  addPreferences: async (preferenceIds: number[]): Promise<void> => {
    const response = await api.apisauce.post<void>("/users/6/preferences", preferenceIds)
    if (!response.ok) {
      throw new Error("Error al editar perfil")
    }
    return response.data
  },
}
