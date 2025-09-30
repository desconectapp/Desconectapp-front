import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useCallback } from "react"
import { chatsService } from "../services/chat"
import { Message } from "../services/chat/Chats.types"


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


export const useGetChatMessages = (groupId: string) => {
  return useQuery({
    queryKey: ["chat", "messages"],
    queryFn: async () => {
      const response = await chatsService.getMessages(groupId)
      if (!response) throw new Error("Error al cargar los mensajes de la chat")
      return { messages: response
      }
    },
  })
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ groupId, message }: { groupId: number, message: string }) => {
      const response = await chatsService.createMessage(groupId, message)
      return response
    },
    onSuccess: () => {
      // Invalidate and refetch messages after creating a new one
      queryClient.invalidateQueries({ queryKey: ["chat", "messages"] })
    },
  })
}

export const useMessageSubscription = (groupId: string, onNewMessage?: (message: Message) => void) => {
  const subscriptionRef = useRef<any>(null)
  const queryClient = useQueryClient()

  const handleNewMessage = useCallback((message: Message) => {
    
    queryClient.setQueryData(["chat", "messages"], (oldData: any) => {
      if (!oldData) return { messages: [message] }
      
      const messageExists = oldData.messages.some((msg: Message) => msg.id === message.id)
      if (messageExists) return oldData
      
      return {
        ...oldData,
        messages: [...oldData.messages, message]
      }
    })
    
    onNewMessage?.(message)
  }, [queryClient, onNewMessage])

  const handleError = useCallback((error: any) => {
    console.error('Message subscription error:', error)
  }, [])

  useEffect(() => {
    const setupSubscription = async () => {
      try {
        subscriptionRef.current = await chatsService.subscribeToMessages(
          groupId,
          handleNewMessage,
          handleError
        )
      } catch (error) {
        console.error('Failed to setup message subscription:', error)
      }
    }

    setupSubscription()

    return () => {
      if (subscriptionRef.current) {
        chatsService.unsubscribeFromMessages(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [groupId, handleNewMessage, handleError])

  return {
    isSubscribed: !!subscriptionRef.current,
    subscription: subscriptionRef.current
  }
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