import { api } from "../api"
import { SupabaseToken, Message } from "./Chats.types"
import { getSupabaseClient, clearSupabaseCache } from "../../supabase-client"
import * as FileSystem from "expo-file-system"

import uuid from "react-native-uuid"

// Cache for the Supabase token to avoid multiple API calls
let cachedSupabaseToken: string | null = null
let tokenExpirationTime: number | null = null

const getSupabaseClientWithToken = async () => {
  const now = Date.now()

  // Check if we have a valid cached token
  if (cachedSupabaseToken && tokenExpirationTime && now < tokenExpirationTime) {
    return getSupabaseClient(cachedSupabaseToken)
  }

  // Fetch new token if cache is invalid
  const tokenData = await chatsService.getToken()
  if (!tokenData?.supabase_token) {
    throw new Error("No se pudo obtener el token de Supabase")
  }

  // Cache the token with expiration
  cachedSupabaseToken = tokenData.supabase_token
  tokenExpirationTime = now + 14 * 60 * 1000 // 14 minutes (1 minute before actual expiration)

  return getSupabaseClient(tokenData.supabase_token)
}

// Alternative function that accepts a token directly (to be used with React Query)
export const getSupabaseClientWithProvidedToken = (token: string) => {
  return getSupabaseClient(token)
}

export const chatsService = {
  getToken: async (): Promise<SupabaseToken | undefined> => {
    const response = await api.apisauce.get<SupabaseToken>(`/chats/token`)
    if (!response.ok) {
      throw new Error("Error al cargar el token de supabase")
    }
    return response.data
  },

  getMessages: async (groupId: string): Promise<Message[] | undefined> => {
    const supabase = await getSupabaseClientWithToken()

    const { error, data } = await supabase.from("messages").select("*").eq("group_id", groupId)

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

    const { error, data } = await supabase
      .from("messages")
      .insert({
        group_id: groupId,
        content: content,
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

  clearSupabaseCache: () => {
    clearSupabaseCache()
    // Also clear our token cache
    cachedSupabaseToken = null
    tokenExpirationTime = null
  },

  subscribeToMessages: async (
    groupId: string,
    onMessage: (message: Message) => void,
    onError?: (error: any) => void,
  ) => {
    const supabase = await getSupabaseClientWithToken()

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
          onMessage(payload.new as Message)
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
          onMessage(payload.new as Message)
        },
      )
      .subscribe()

    return subscription
  },

  unsubscribeFromMessages: async (subscription: any) => {
    if (subscription) {
      const supabase = await getSupabaseClientWithToken()
      await supabase.removeChannel(subscription)
    }
  },

  uploadGroupImage: async (
    groupId: number,
    fileUri: string,
  ): Promise<{ url: string; path: string }> => {
    console.log("uploading")
    const supabase = await getSupabaseClientWithToken()
    console.log(supabase)

    const id = uuid.v1()

    // Build a unique path inside the bucket per group
    const fileExt = fileUri.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `${id}.${fileExt}`
    const filePath = `${groupId}/${fileName}`

    // Convert the local URI to an ArrayBuffer (RN-friendly)
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const arrayBuffer = bytes.buffer

    const { error: uploadError } = await supabase.storage
      .from("group-imgs")
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false,
      })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      throw new Error(`Error al subir la imagen: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabase.storage.from("group-imgs").getPublicUrl(filePath)

    const url = publicUrlData?.publicUrl
    if (!url) {
      throw new Error("No se pudo obtener la URL pÃºblica de la imagen")
    }

    return { url, path: filePath }
  },

  uploadProfileImage: async (
    userId: string,
    fileUri: string,
  ): Promise<{ url: string; path: string }> => {
    console.log("uploading")
    const supabase = await getSupabaseClientWithToken()
    console.log(supabase)

    const id = uuid.v1()

    // Build a unique path inside the bucket per group
    const fileExt = fileUri.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `${id}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Convert the local URI to an ArrayBuffer (RN-friendly)
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const arrayBuffer = bytes.buffer

    const { error: uploadError } = await supabase.storage
      .from("profile-imgs")
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false,
      })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      throw new Error(`Error al subir la imagen: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabase.storage.from("profile-imgs").getPublicUrl(filePath)

    const url = publicUrlData?.publicUrl
    if (!url) {
      throw new Error("No se pudo obtener la URL pÃºblica de la imagen")
    }

    return { url, path: filePath }
  },
}
