import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { searchService } from "@/services/search"

export const useSearch = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, any>({
    mutationFn: (data) => searchService.search(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search"] })
    },
  })
}
