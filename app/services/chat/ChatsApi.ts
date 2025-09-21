import { api } from "../api"
import { SupabaseToken, Message } from "./Chats.types"
import { supabase } from "../../supabase-client"

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
    const {error, data} = await supabase.from("messages").select("*")
    console.log("data", data)
    if (!data) {
      throw new Error("Error al cargar los mensajes de la chat")
    }
    return data as Message[]
  },
}

