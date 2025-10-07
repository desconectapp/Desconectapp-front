import { api } from "../api"
import {
  CreateProfileData,
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
      throw new Error("Error al iniciar sesión")
    }
    try {
      api.setToken(response.data || null)
    } catch (error) {
      console.error("API:LOGIN: Error al establecer el token:", error)
      throw new Error("Error al procesar la sesión")
    }

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
    const response = await api.apisauce.post<void>("/users/profile", data)
    if (!response.ok) {
      throw new Error("Error al crear perfil")
    }
    return response.data
  },

  getProfile: async (): Promise<ProfileData | undefined> => {
    const response = await api.apisauce.get<ProfileData>("/users/user")
    if (!response.ok) {
      throw new Error("Error al obtener perfil")
    }
    return response.data
  },

  editProfile: async (data: ProfileData): Promise<void> => {
    const response = await api.apisauce.put<void>("/users/profile", data)
    if (!response.ok) {
      throw new Error("Error al editar perfil")
    }
    return response.data
  },

  addPreferencesBatch: async (preferenceIds: number[]): Promise<void> => {
    const response = await api.apisauce.post<void>("/preferences/batch", preferenceIds)
    if (!response.ok) {
      throw new Error("Error al editar perfil")
    }
    return response.data
  },

  validateEmail: async (code: string, user_id: number): Promise<void> => {
    const response = await api.apisauce.post<void>("/auth/email/verify", { code, user_id })
    if (!response.ok) {
      throw new Error("Error al validar email")
    }
    return response.data
  },

  forgotPassword: async (email: string): Promise<number> => {
    const response = await api.apisauce.post<void>("/auth/password/forgot", { email })
    if (!response.ok) {
      throw new Error("Error al validar email")
    }

    return response.data
  },

  resetPassword: async (code: string, newPassword: string, userId: number): Promise<void> => {
    const response = await api.apisauce.post<void>("/auth/password/update", {
      code,
      new_password: newPassword,
      user_id: userId,
    })
    if (!response.ok) {
      throw new Error("Error al resetear password")
    }
    return response.data
  },
}
