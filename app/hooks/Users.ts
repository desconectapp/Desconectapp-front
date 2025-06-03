import { useQuery } from "@tanstack/react-query"
import { userService } from "../services/users"

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userService.getUsers()
      if (!response) throw new Error('Error al cargar usuarios')
      return response
    },
  })
}
