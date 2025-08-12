import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { searchService } from "@/services/search"
import { activitiesService } from "@/services/activities"

export const useSearch = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, any>({
    mutationFn: (data) => searchService.search(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search"] })
    },
  })
}

export const useActivityRequests = () => {
  return useQuery({
    queryKey: ["activity-requests"],
    queryFn: async () => {
      const response = await activitiesService.getActivityRequests()
      if (!response) throw new Error("Error al cargar solicitudes de actividades")
      return response
    },
  })
}
