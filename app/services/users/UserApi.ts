import { api } from "../api"
import { UserResponse } from "./UserApi.types"

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

  login: async (data: { email: string; password: string }): Promise<void> => {
    const response = await api.apisauce.post<void>("/users/login", data)
    if (!response.ok) {
      throw new Error("Error al iniciar sesión")
    }
    console.log("Usuario autenticado:", response.data)
    return response.data
  },
}
