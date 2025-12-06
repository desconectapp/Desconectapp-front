import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { userService } from "../services/users"
import { activitiesService } from "../services/activities"
import { chatsService } from "../services/chat"

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await userService.getUsers()
      if (!response) throw new Error("Error al cargar usuarios")
      return response
    },
  })
}

export const useSignUp = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, any>({
    mutationFn: (data) => userService.signUp(data),
    onSuccess: (data) => {
      chatsService.clearSupabaseCache()
      return data
    },
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, any>({
    mutationFn: (data) => userService.login(data),
    onSuccess: (data) => {
      chatsService.clearSupabaseCache()
      return data
    },
  })
}

export const useCreateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, any>({
    mutationFn: (data) => userService.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}

export const useEditProfile = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, any>({
    mutationFn: (data) => userService.editProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}

export const useAddPreferencesBatch = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, { activity_ids: number[]; custom_activities: string[] }>({
    mutationFn: (variables: { activity_ids: number[]; custom_activities: string[] }) =>
      userService.addPreferencesBatch(variables.activity_ids, variables.custom_activities),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] })
    },
  })
}

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userService.getProfile()
      if (!response) throw new Error("Error al cargar perfil")
      return response
    },
  })
}

export const useActivities = (limit: number = 10, offset: number = 0, query: string = "") => {
  return useQuery({
    queryKey: ["activities", limit, offset, query],
    queryFn: async () => {
      const response = await activitiesService.getActivities(limit, offset, query)
      if (!response) throw new Error("Error al cargar preferencias")
      return response
    },
  })
}

export const useUserPreferences = () => {
  return useQuery({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      const response = await activitiesService.getActivitiesFromUser()
      if (!response) throw new Error("Error al cargar preferencias del usuario")
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}