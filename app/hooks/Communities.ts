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

export const useCommunityById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["groups", id],
    queryFn: async () => {
      const response = await communityService.getCommunityById(id)
      if (!response) throw new Error("Error al cargar grupos")
      return response
    },
    enabled: options?.enabled ?? true,
  })
}

export const updateCommunityDescription = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, { id: string; description: string }>({
    mutationFn: ({ id, description }) => communityService.updateCommunityDescription(id, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export const updateCommunityLocation = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, { id: string; location: string; location_name: string }>({
    mutationFn: ({ id, location, location_name }) =>
      communityService.updateCommunityLocation(id, location, location_name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export const useExitCommunity = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, any>({
    mutationFn: (id) => communityService.exitCommunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export const updateCommunityName = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, { id: string; name: string }>({
    mutationFn: ({ id, name }) => communityService.updateCommunityName(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}