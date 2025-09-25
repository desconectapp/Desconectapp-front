import { api } from "../api"
import { Group, GroupData, PaginatedOpenGroup, PaginatedUserGroups } from "./Groups.types"

export const groupsService = {
  getGroups: async (): Promise<PaginatedUserGroups | undefined> => {
    const response = await api.apisauce.get<PaginatedUserGroups>(`/groups/user`)
    if (!response.ok) {
      throw new Error("Error al cargar los grupos")
    }
    return response.data
  },

  getGroupsRecs: async (activity_id: number): Promise<PaginatedOpenGroup | undefined> => {
    const response = await api.apisauce.get<PaginatedOpenGroup>(`/groups/recs`, {activity_id})
    if (!response.ok) {
      throw new Error("Error al cargar las sugerencias para el usuario")
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
    const response = await api.apisauce.delete<GroupData>(`/groups/user-from-group/${id}`)
    if (!response.ok) {
      throw new Error("Error al salir del grupo")
    }
    return true
  },

  changeStatus: async (id: string, status: boolean): Promise<boolean> => {
    const response = await api.apisauce.put(`/groups/status/${id}`, { status });
    if (!response.ok) {
      throw new Error("Error al cambiar el status del grupo");
    }
    return true;
  },

  updateGroupDescription: async (id: string, description: string): Promise<boolean> => {
    const response = await api.apisauce.put(`/groups/description/${id}`, { description });
    if (!response.ok) {
      throw new Error("Error al cambiar la descripcion del grupo");
    }
    return true;
  },

  updateGroupName: async (id: string, name: string): Promise<boolean> => {
    const response = await api.apisauce.put(`/groups/name/${id}`, { name });
    if (!response.ok) {
      throw new Error("Error al cambiar el nombre del grupo");
    }
    return true;
  },

  updateGroupLocation: async (id: string, location: string): Promise<boolean> => {
    const response = await api.apisauce.put(`/groups/location/${id}`, { location });
    if (!response.ok) {
      throw new Error("Error al cambiar la location del grupo");
    }
    return true;
  },

  updateGroupPhoto: async (id: string, photo: string): Promise<boolean> => {
    const response = await api.apisauce.put(`/groups/photo/${id}`, { photo });
    if (!response.ok) {
      throw new Error("Error al cambiar la foto del grupo");
    }
    return true;
  },

}