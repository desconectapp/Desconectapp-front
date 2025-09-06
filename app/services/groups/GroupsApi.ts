import { api } from "../api"
import { Group, GroupData } from "./Groups.types"

export const groupsService = {
  getGroups: async (): Promise<Group[] | undefined> => {
    const response = await api.apisauce.get<Group[]>(`/groups/user`)
    if (!response.ok) {
      throw new Error("Error al cargar los grupos")
    }
    return response.data
  },

  getGroupById: async (id: string): Promise<GroupData | undefined> => {
    const response = await api.apisauce.get<GroupData>(`/groups/${id}`)
    if (!response.ok) {
      throw new Error("Error al cargar el grupo")
    }
    return response.data
  },

  exitGroup: async (id: string): Promise<boolean> => {
    const response = await api.apisauce.post<GroupData>(`/groups/${id}/exit`)
    if (!response.ok) {
      throw new Error("Error al cargar el grupo")
    }
    return true
  },
}
