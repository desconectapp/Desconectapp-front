import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useCallback } from "react"
import { chatsService, getSupabaseClientWithProvidedToken } from "../services/chat"
import { Message } from "../services/chat/Chats.types"

export const useObtainToken = () => {
  return useQuery({
    queryKey: ["chats", "token"],
    queryFn: async () => {
      const response = await chatsService.getToken()
      if (!response) throw new Error("Error al cargar el token de supabase")
      return { token: response.supabase_token, expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export const useGetChatMessages = (groupId: string) => {
  const { data: tokenData } = useObtainToken()

  return useQuery({
    queryKey: ["chat", "messages", groupId],
    queryFn: async () => {
      if (!tokenData?.token) {
        throw new Error("No token available")
      }

      const supabase = getSupabaseClientWithProvidedToken(tokenData.token)
      const { error, data } = await supabase.from("messages").select("*").eq("group_id", groupId)

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Error al cargar los mensajes: ${error.message}`)
      }

      if (!data) {
        throw new Error("No se encontraron mensajes")
      }

      return { messages: data as Message[] }
    },
    enabled: !!tokenData?.token, // Only run when we have a token
  })
}

export const useUploadGroupImage = () => {
  return useMutation({
    mutationFn: async ({ groupId, uri }: { groupId: number; uri: string }) => {
      const { url } = await chatsService.uploadGroupImage(groupId, uri)
      return url
    },
  })
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient()
  const { data: tokenData } = useObtainToken()

  return useMutation({
    mutationFn: async ({
      groupId,
      message,
      imageUrl,
    }: {
      groupId: number
      message: string
      imageUrl: string | null
    }) => {
      if (!tokenData?.token) {
        throw new Error("No token available")
      }

      const supabase = getSupabaseClientWithProvidedToken(tokenData.token)
      const { error, data } = await supabase
        .from("messages")
        .insert({
          group_id: groupId,
          content: message,
          image_url: imageUrl,
          sent_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Error al crear el mensaje: ${error.message}`)
      }

      return data as Message
    },
    onSuccess: () => {
      // Invalidate and refetch messages after creating a new one
      queryClient.invalidateQueries({ queryKey: ["chat", "messages"] })
    },
  })
}

export const useMessageSubscription = (
  groupId: string,
  onNewMessage?: (message: Message) => void,
) => {
  const subscriptionRef = useRef<any>(null)
  const queryClient = useQueryClient()
  const { data: tokenData } = useObtainToken()

  const handleNewMessage = useCallback(
    (message: Message) => {
      queryClient.setQueryData(["chat", "messages", groupId], (oldData: any) => {
        if (!oldData) return { messages: [message] }

        const messageExists = oldData.messages.some((msg: Message) => msg.id === message.id)
        if (messageExists) return oldData

        return {
          ...oldData,
          messages: [...oldData.messages, message],
        }
      })

      onNewMessage?.(message)
    },
    [queryClient, onNewMessage, groupId],
  )

  const handleError = useCallback((error: any) => {
    console.error("Message subscription error:", error)
  }, [])

  useEffect(() => {
    if (!tokenData?.token) return

    const setupSubscription = async () => {
      try {
        const supabase = getSupabaseClientWithProvidedToken(tokenData.token)

        const subscription = supabase
          .channel(`messages:group_id=eq.${groupId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `group_id=eq.${groupId}`,
            },
            (payload) => {
              handleNewMessage(payload.new as Message)
            },
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "messages",
              filter: `group_id=eq.${groupId}`,
            },
            (payload) => {
              handleNewMessage(payload.new as Message)
            },
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
            } else if (status === "CHANNEL_ERROR") {
              console.error("Channel subscription error")
              handleError(new Error("Channel subscription failed"))
            }
          })

        subscriptionRef.current = subscription
      } catch (error) {
        console.error("Failed to setup message subscription:", error)
      }
    }

    setupSubscription()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [groupId, handleNewMessage, handleError, tokenData?.token])

  return {
    isSubscribed: !!subscriptionRef.current,
    subscription: subscriptionRef.current,
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

