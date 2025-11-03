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

}