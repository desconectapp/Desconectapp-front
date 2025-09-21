import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { chatsService } from "../services/chat"


export const useObtainToken = () => {
  return useQuery({
    queryKey: ["chats", "token"],
    queryFn: async () => {
      const response = await chatsService.getToken()
      if (!response) throw new Error("Error al cargar el token de supabase")
      return { token: response.supabase_token, expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    },
  })
}


export const getChatMessages = () => {
  return useQuery({
    queryKey: ["chat", "messages"],
    queryFn: async () => {
      const response = await chatsService.getMessages()
      if (!response) throw new Error("Error al cargar los mensajes de la chat")
      return { messages: response
      }
    },
  })
}

/*export const useExitGroup = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, any>({
    mutationFn: (id) => groupsService.exitGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}
*/ 