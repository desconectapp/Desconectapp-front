import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { groupsService } from "../services/groups"
import { CreateGroupParams, GroupData } from "@/services/groups/Groups.types"

export const useExitGroup = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, any>({
    mutationFn: (id) => groupsService.exitGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export const useGroups = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await groupsService.getGroups()
      if (!response) throw new Error("Error al cargar grupos")
      return response
    },
    enabled: options?.enabled ?? true,
  })
}

export const useGroupsRecs = (activity_id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["groupsRecs", activity_id],
    queryFn: async () => {
      const response = await groupsService.getGroupsRecs(activity_id)
      if (!response) throw new Error("Error al cargar grupos")
      return response
    },
    enabled: options?.enabled ?? true,
  })
}

export const useGroupById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["groups", id],
    queryFn: async () => {
      const response = await groupsService.getGroupById(id)
      if (!response) throw new Error("Error al cargar grupos")
      return response
    },
    enabled: options?.enabled ?? true,
  })
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient()

  return useMutation<GroupData | undefined, Error, CreateGroupParams>({
    mutationFn: (params) => groupsService.createGroup(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export const useChangeGroupStatus = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, { id: string; public_g: boolean }>({
    mutationFn: ({ id, public_g }) => groupsService.changeStatus(id, public_g),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export const updateGroupDescription = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, { id: string; description: string }>({
    mutationFn: ({ id, description }) => groupsService.updateGroupDescription(id, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export const updateGroupName = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, { id: string; name: string }>({
    mutationFn: ({ id, name }) => groupsService.updateGroupName(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export const updateGroupLocation = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, { id: string; location: string, location_name: string }>({
    mutationFn: ({ id, location, location_name }) => groupsService.updateGroupLocation(id, location, location_name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export const useUpdateGroupPhoto = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, { id: string; avatar_url: string }>({
    mutationFn: ({ id, avatar_url }) => groupsService.updateGroupPhoto(id, avatar_url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export const useJoinGroup = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, { id: string }>({
    mutationFn: ({ id }) => groupsService.joinGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  });
};

export const useNearbyGroups = (latitude: number, longitude: number, radius: number) => {
  return useQuery({
    queryKey: ["nearbyGroups", latitude, longitude, radius],
    queryFn: async () => {
      const response = await groupsService.getNearbyGroups(latitude, longitude, radius)
      if (!response) throw new Error("Error al cargar grupos cercanos")
      return response
    },
  })
}

