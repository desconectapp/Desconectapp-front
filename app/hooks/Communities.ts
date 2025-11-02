import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { communityService } from "../services/communities"
import { CreateCommunityParams, CommunityData } from "@/services/communities/Communities.types"


export const useCreateCommunity = () => {
  const queryClient = useQueryClient()

  return useMutation<CommunityData | undefined, Error, CreateCommunityParams>({
    mutationFn: (params) => communityService.createCommunity(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community"] })
    },
  })
}

export const useCommunity = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["community"],
    queryFn: async () => {
      const response = await communityService.getCommunities()
      if (!response) throw new Error("Error al cargar comunidades")
      return response
    },
    enabled: options?.enabled ?? true,
  })
}