import { api } from "../api"
import { CommunityData, CreateCommunityParams, PaginatedCommunity } from "./Communities.types"

export const communityService = {
    createCommunity: async (params: CreateCommunityParams): Promise<CommunityData | undefined> => {
        const response = await api.apisauce.post<CommunityData>(`/community`, params);
        
        if (!response.ok) {
            throw new Error(`Error al crear el grupo: ${response.problem}`);
        }
        
        return response.data;
    },

    getCommunities: async (): Promise<PaginatedCommunity | undefined> => {
        const response = await api.apisauce.get<PaginatedCommunity>(`/community/user`)
        if (!response.ok) {
          throw new Error("Error al cargar los grupos")
        }
        return response.data
      },

    getCommunityById: async (id: string): Promise<CommunityData | undefined> => {
        const response = await api.apisauce.get<CommunityData>(`/community/${id}`)
        if (!response.ok) {
          throw new Error("Error al cargar el grupo")
        }
        return response.data
      },

    updateCommunityLocation: async (id: string, location: string, location_name: string): Promise<boolean> => {
      const response = await api.apisauce.put(`/community/location/${id}`, { location, location_name });
      if (!response.ok) {
        throw new Error("Error al cambiar la location de la community");
      }
      return true;
    },

    updateCommunityDescription: async (id: string, description: string): Promise<boolean> => {
      const response = await api.apisauce.put(`/community/description/${id}`, { description });
      if (!response.ok) {
        throw new Error("Error al cambiar la descripcion de la community");
      }
      return true;
    },

    exitCommunity: async (id: string): Promise<boolean> => {
        const response = await api.apisauce.delete<CommunityData>(`/community/user-from-community/${id}`)
        if (!response.ok) {
          throw new Error("Error al salir de la community")
        }
        return true
      },

    updateCommunityName: async (id: string, name: string): Promise<boolean> => {
      const response = await api.apisauce.put(`/community/name/${id}`, { name });
      if (!response.ok) {
        throw new Error("Error al cambiar el nombre de la community");
      }
      return true;
    },

    updateCommunityAvatar: async (id: string, avatar_url: string): Promise<boolean> => {
      const response = await api.apisauce.put(`/community/avatar/${id}`, { avatar_url });
      if (!response.ok) {
        throw new Error("Error al cambiar el avatar de la community");
      }
      return true;
    },
    

}