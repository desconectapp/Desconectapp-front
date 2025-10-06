import { MapGroup } from "@/components/Location/MapView"
import { api } from "../api"
import { Group, GroupData, OpenGroup, PaginatedOpenGroup, PaginatedUserGroups } from "./Groups.types"

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

  joinGroup: async (id: string): Promise<boolean> => {
    const response = await api.apisauce.put(`/groups/add-user/${id}`);
    if (!response.ok) {
      throw new Error("Error al unirse al grupo");
    }
    return true;
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

  changeStatus: async (id: string, public_g: boolean): Promise<boolean> => {
    const response = await api.apisauce.put(`/groups/public/${id}`, { public_g });
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
  getNearbyGroups: async (latitude: number, longitude: number, radius_km: number): Promise<MapGroup[]> => {
    const response = await api.apisauce.get<{groups: OpenGroup[]}>(`/groups/open`, {
      latitude,
      longitude,
      radius: radius_km
    });
    if (!response.ok) {
      console.log("Error fetching nearby groups:", response.problem);
      throw new Error("Error al cargar los grupos cercanos");
    }
    const modifiedResponse: MapGroup[] = (response.data?.groups || []).map((group) => {
      // Parse location string which should be in format "latitude,longitude"
      const locationParts = group.location.split(",");
      const latitude = parseFloat(locationParts[0]?.trim() || "0");
      const longitude = parseFloat(locationParts[1]?.trim() || "0");
      
      return {
        id: group.id.toString(),
        name: group.name,
        icon: group.photo || "👥",
        coordinates: [longitude, latitude] as [number, number], // MapLibre expects [lng, lat]
        location: group.location,
        description: group.description,
        membersCount: group.member_count,
        radius: 1 // Default radius, adjust as needed
      };
    });
    return modifiedResponse??[];
  }
}
