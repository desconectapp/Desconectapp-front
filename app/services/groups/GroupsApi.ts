import { api } from "../api"
import { Group, GroupData } from "./Groups.types"

export const groupsService = {
  getGroups: async (): Promise<Group[] | undefined> => {
    const response = await api.apisauce.get<Group[]>(`/groups`)
    if (!response.ok) {
      throw new Error("Error al cargar los grupos")
    }
    return response.data
  },

  getGroupById: async (id: string): Promise<GroupData | undefined> => {
    return {
      id: "group123",
      name: "Futbol Palermo",
      description: "Grupo de futbol amateur en Palermo",
      created_at: "2023-10-01T12:00:00Z",
      activity: "Football",
      icon: "⚽",
      location: "Palermo, Buenos Aires",
      members: [
        { id: "1", name: "Lionel Messi" },
        { id: "2", name: "Fideo Di Maria" },
        { id: "3", name: "Paulo Dybala" },
        { id: "4", name: "Lautaro Martinez" },
        { id: "currentUser", name: "You" },
      ],
    }
    const response = await api.apisauce.get<GroupData>(`/groups/${id}`)
    if (!response.ok) {
      throw new Error("Error al cargar el grupo")
    }
    return response.data
  },

  exitGroup: async (id: string): Promise<boolean> => {
    // const response = await api.apisauce.post<GroupData>(`/groups/${id}/exit`)
    // if (!response.ok) {
    //   throw new Error("Error al cargar el grupo")
    // }
    return true
  },
}
