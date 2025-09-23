import { api } from "../api"
import { SupabaseToken, Message } from "./Chats.types"
import { getSupabaseClient, clearSupabaseCache } from "../../supabase-client"

// Helper function to get a Supabase client with JWT token (with caching)
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

  getMessages: async (): Promise<Message[] | undefined> => {
    // Get a Supabase client with JWT token
    const supabase = await getSupabaseClientWithToken()

    // Now make the Supabase query with the JWT token
    const {error, data} = await supabase.from("messages").select("*")
    console.log("data", data)
    
    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Error al cargar los mensajes: ${error.message}`)
    }
    
    if (!data) {
      throw new Error("No se encontraron mensajes")
    }
    
    return data as Message[]
  },

  // Example method for creating messages with JWT token
  createMessage: async (groupId: number, content: string): Promise<Message | undefined> => {
    // Get a Supabase client with JWT token
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

  // Method to clear Supabase cache (useful for logout)
  clearSupabaseCache: () => {
    clearSupabaseCache()
  }
}

