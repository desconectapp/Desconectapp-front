import { useQuery } from "@tanstack/react-query"
import { userService } from "../services/users"


export const useCatFact = () => {
  return useQuery<string>({
    queryKey: ["cat"],
    queryFn: userService.getUsers,
  })
}