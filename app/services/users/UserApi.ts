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
    return
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
    // const response = await api.apisauce.get<void>("/users/profile")
    // if (!response.ok) {
    //   throw new Error("Error al obtener perfil")
    // }
    // return response.data

    return {
      name: "Lionel Messi",
      image: null,
      location: "Miami, FL",
      gender: "",
      workStatus: "Employed",
      preferences: ["chess", "football", "basketball"],
    }
  },

  editProfile: async (data: ProfileData): Promise<void> => {
    return
    const response = await api.apisauce.put<void>("/users/profile", data)
    if (!response.ok) {
      throw new Error("Error al editar perfil")
    }
    return response.data
  },

  login: async (data: { email: string; password: string }): Promise<void> => {
    return
    const response = await api.apisauce.post<void>("/users/login", data)
    if (!response.ok) {
      throw new Error("Error al iniciar sesión")
    }
    console.log("Usuario autenticado:", response.data)
    return response.data
  },
}
