import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { groupsService } from "../services/groups"

export const useExitGroup = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, any>({
    mutationFn: (id) => groupsService.exitGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export const useGroups = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await groupsService.getGroups()
      if (!response) throw new Error("Error al cargar grupos")
      return response
    },
  })
}

export const useGroupById = (id: string) => {
  return useQuery({
    queryKey: ["groups", id],
    queryFn: async () => {
      const response = await groupsService.getGroupById(id)
      if (!response) throw new Error("Error al cargar grupos")
      return response
    },
  })
}

export const useChangeGroupStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { id: string; status: boolean }>({
    mutationFn: ({ id, status }) => groupsService.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const updateGroupDescription = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { id: string; description: string }>({
    mutationFn: ({ id, description }) => groupsService.updateGroupDescription(id, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};