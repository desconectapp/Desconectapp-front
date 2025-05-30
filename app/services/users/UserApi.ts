import { api } from "../api"
import { catFact } from "./UserApi.types"

export const userService = {
  getUsers: async (): Promise<string> => {
    const response = await api.apisauce.get<catFact>("/fact")
    if (!response.ok) {
      throw new Error("Error al cargar usuarios")
    }
    return response.data?.fact ?? "No fact available"
  },
}
