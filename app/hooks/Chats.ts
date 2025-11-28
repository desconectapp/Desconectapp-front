import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useRef, useCallback } from "react"
import { chatsService, getSupabaseClientWithProvidedToken } from "../services/chat"
import { Message } from "../services/chat/Chats.types"
import { useStores } from "../models"

export const useObtainToken = () => {
  const { sessionStore } = useStores()

  return useQuery({
    queryKey: ["chats", "token", sessionStore.user_uuid],
    queryFn: async () => {
      const response = await chatsService.getToken()
      if (!response) throw new Error("Error al cargar el token de supabase")
      return { token: response.supabase_token, expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
    },
    staleTime: 12 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!sessionStore.user_uuid,
    retry: 3,
    retryDelay: 1000,
  })
}

export const useGetLastChatMessages = (user_uuid: string) => {
  const { data: tokenData, refetch: refetchToken } = useObtainToken()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ["chat", "last_messages", user_uuid],
    queryFn: async () => {
      if (user_uuid === "") {
        return []
      }

      if (!tokenData?.token) {
        throw new Error("No token available")
      }

      const supabase = getSupabaseClientWithProvidedToken(tokenData.token)
      const { error, data } = await supabase.rpc("get_last_message_per_group_with_seen", {
        p_user_id: user_uuid,
        p_limit: 200,
      })

      // console.log("RPC get_last_message_per_group data:", data)

      if (error) {
        if (error.code === "PGRST303" || error.message?.includes("JWT expired")) {
        } else {
          // console.error("Supabase error:", error)
        }
        throw new Error(`Error al cargar los mensajes: ${error.message}`)
      }

      if (!data) {
        throw new Error("No se encontraron mensajes")
      }

      return data
    },
    enabled: !!tokenData?.token,
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      if (error.message?.includes("JWT expired")) {
        return false
      }
      return failureCount < 3
    },
  })
}

export const useGetChatMessages = (groupId: string) => {
  const { data: tokenData, refetch: refetchToken } = useObtainToken()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ["chat", "messages", groupId],
    queryFn: async () => {
      if (!tokenData?.token) {
        throw new Error("No token available")
      }

      const supabase = getSupabaseClientWithProvidedToken(tokenData.token)
      const { error, data } = await supabase.from("messages").select("*").eq("group_id", groupId)

      if (error) {
        if (error.code === "PGRST303" || error.message?.includes("JWT expired")) {
          console.log("JWT expired, refreshing token and retrying...")
          queryClient.invalidateQueries({ queryKey: ["chats", "token"] })
          await new Promise((resolve) => setTimeout(resolve, 1000))
          const newTokenResult = await refetchToken()
          if (!newTokenResult.data?.token) {
            throw new Error("Failed to refresh token")
          }
          const newSupabase = getSupabaseClientWithProvidedToken(newTokenResult.data.token)
          const { error: retryError, data: retryData } = await newSupabase
            .from("messages")
            .select("*")
            .eq("group_id", groupId)
          if (retryError) {
            console.error("Supabase retry error:", retryError)
            throw new Error(`Error al cargar los mensajes: ${retryError.message}`)
          }
          if (!retryData) {
            throw new Error("No se encontraron mensajes")
          }
          return { messages: retryData as Message[] }
        } else {
          //console.error("Supabase error:", error)
        }
        throw new Error(`Error al cargar los mensajes: ${error.message}`)
      }

      if (!data) {
        throw new Error("No se encontraron mensajes")
      }

      return { messages: data as Message[] }
    },
    enabled: !!tokenData?.token,
    retry: (failureCount, error) => {
      if (error.message?.includes("JWT expired")) {
        return false
      }
      return failureCount < 3
    },
  })
}

export const useMarkAsSeen = (user_uuid: string) => {
  const { data: tokenData, refetch: refetchToken } = useObtainToken()

  return useMutation({
    mutationFn: async (groupId: number) => {
      if (!tokenData?.token) {
        throw new Error("No token available")
      }
      const supabase = getSupabaseClientWithProvidedToken(tokenData.token)

      const { error: error2, data: data2 } = await supabase.rpc("seen", {
        p_user_id: user_uuid,
        p_group_id: groupId,
      })
      console.log("RPC seen result:", { error2, data2 })

      if (error2) {
        if (error2.code === "PGRST303" || error2.message?.includes("JWT expired")) {
          console.log("JWT expired, refreshing token and retrying...")
          await refetchToken()
          const newSupabase = getSupabaseClientWithProvidedToken(tokenData.token)
          const { error: retryError, data: retryData } = await newSupabase.rpc("seen", {
            p_user_id: user_uuid,
            p_group_id: groupId,
          })
          if (retryError) {
            throw new Error(`Error al marcar como visto: ${retryError.message}`)
          }
          return retryData
        }
        throw new Error(`Error al marcar como visto: ${error2.message}`)
      }

      return data2
    },
    retry: 2,
  })
}

export const useInfiniteChatMessages = (groupId: string, options?: { pageSize?: number }) => {
  const { data: tokenData, refetch: refetchToken } = useObtainToken()
  const queryClient = useQueryClient()
  const pageSize = options?.pageSize ?? 30

  type Page = { items: Message[]; nextCursor: number | null }

  return useInfiniteQuery<Page>({
    queryKey: ["chat", "messages", groupId, "infinite", pageSize],
    queryFn: async ({ pageParam }): Promise<Page> => {
      if (!tokenData?.token) {
        throw new Error("No token available")
      }

      const supabase = getSupabaseClientWithProvidedToken(tokenData.token)

      const cursor = typeof pageParam === "number" ? pageParam : undefined

      let query = supabase
        .from("messages")
        .select("*")
        .eq("group_id", groupId)
        .order("id", { ascending: false })
        .limit(pageSize)

      if (cursor !== undefined) {
        query = query.lt("id", cursor)
      }

      const { error, data } = await query

      if (error) {
        if (error.code === "PGRST303" || error.message?.includes("JWT expired")) {
          queryClient.invalidateQueries({ queryKey: ["chats", "token"] })
          await new Promise((resolve) => setTimeout(resolve, 1000))
          const newTokenResult = await refetchToken()
          if (!newTokenResult.data?.token) {
            throw new Error("Failed to refresh token")
          }
          const newSupabase = getSupabaseClientWithProvidedToken(newTokenResult.data.token)
          let newQuery = newSupabase
            .from("messages")
            .select("*")
            .eq("group_id", groupId)
            .order("id", { ascending: false })
            .limit(pageSize)
          if (cursor !== undefined) {
            newQuery = newQuery.lt("id", cursor)
          }
          const { error: retryError, data: retryData } = await newQuery
          if (retryError) {
            throw new Error(`Error al cargar los mensajes: ${retryError.message}`)
          }
          const items = (retryData ?? []) as Message[]
          const nextCursor = items.length === pageSize ? items[items.length - 1].id : null
          return { items, nextCursor }
        }
        throw new Error(`Error al cargar los mensajes: ${error.message}`)
      }

      const items = (data ?? []) as Message[]
      const nextCursor = items.length === pageSize ? items[items.length - 1].id : null
      return { items, nextCursor }
    },
    getNextPageParam: (lastPage: Page) => lastPage.nextCursor,
    enabled: !!tokenData?.token && !!groupId,
    retry: 2,
    initialPageParam: undefined,
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

export const useUploadProfileImage = () => {
  return useMutation({
    mutationFn: async ({ userId, uri }: { userId: string; uri: string }) => {
      const { url } = await chatsService.uploadProfileImage(userId, uri)
      return url
    },
  })
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient()
  const { data: tokenData, refetch: refetchToken } = useObtainToken()

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
        if (error.code === "PGRST303" || error.message?.includes("JWT expired")) {
          console.log("JWT expired, refreshing token and retrying...")
          queryClient.invalidateQueries({ queryKey: ["chats", "token"] })
          await new Promise((resolve) => setTimeout(resolve, 1000))
          const newTokenResult = await refetchToken()
          if (!newTokenResult.data?.token) {
            throw new Error("Failed to refresh token")
          }
          const newSupabase = getSupabaseClientWithProvidedToken(newTokenResult.data.token)
          const { error: retryError, data: retryData } = await newSupabase
            .from("messages")
            .insert({
              group_id: groupId,
              content: message,
              image_url: imageUrl,
              sent_at: new Date().toISOString(),
            })
            .select()
            .single()
          if (retryError) {
            console.error("Supabase retry error:", retryError)
            throw new Error(`Error al crear el mensaje: ${retryError.message}`)
          }
          return retryData as Message
        } else {
         // console.error("Supabase error:", error)
        }
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
  options?: { enabled?: boolean },
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
    if (options?.enabled !== true) return
    if (!groupId) return

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
          .subscribe()

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
  }, [groupId, handleNewMessage, handleError, tokenData?.token, options?.enabled])

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
