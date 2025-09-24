import { api } from "../api"
import { SupabaseToken, Message } from "./Chats.types"
import { getSupabaseClient, clearSupabaseCache } from "../../supabase-client"

const getSupabaseClientWithToken = async () => {
  const tokenData = await chatsService.getToken()
  if (!tokenData?.supabase_token) {
    throw new Error("No se pudo obtener el token de Supabase")
  }
  return getSupabaseClient(tokenData.supabase_token)
}

export const chatsService = {
  getToken: async (): Promise<SupabaseToken | undefined> => {
    const response = await api.apisauce.get<SupabaseToken>(`/chats/token`)
    console.log("response", response)
    if (!response.ok) {
      throw new Error("Error al cargar el token de supabase")
    }
    return response.data
  },

  getMessages: async (groupId: string): Promise<Message[] | undefined> => {
    const supabase = await getSupabaseClientWithToken()

    const {error, data} = await supabase.from("messages").select("*").eq("group_id", groupId)

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Error al cargar los mensajes: ${error.message}`)
    }
    
    if (!data) {
      throw new Error("No se encontraron mensajes")
    }
    
    return data as Message[]
  },

  createMessage: async (groupId: number, content: string): Promise<Message | undefined> => {
    const supabase = await getSupabaseClientWithToken()

    const {error, data} = await supabase
      .from("messages")
      .insert({
        group_id: groupId,
        content: content,
        sent_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Error al crear el mensaje: ${error.message}`)
    }

    return data as Message
  },

  clearSupabaseCache: () => {
    clearSupabaseCache()
  },

  subscribeToMessages: async (groupId: string, onMessage: (message: Message) => void, onError?: (error: any) => void) => {
    const supabase = await getSupabaseClientWithToken()

    const subscription = supabase
      .channel(`messages:group_id=eq.${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          console.log('New message received:', payload.new)
          onMessage(payload.new as Message)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          console.log('Message updated:', payload.new)
          onMessage(payload.new as Message)
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to messages for group ${groupId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel subscription error')
          onError?.(new Error('Channel subscription failed'))
        }
      })

    return subscription
  },

  unsubscribeFromMessages: async (subscription: any) => {
    if (subscription) {
      const supabase = await getSupabaseClientWithToken()
      await supabase.removeChannel(subscription)
      console.log('Unsubscribed from messages')
    }
  }
}

