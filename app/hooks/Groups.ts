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
