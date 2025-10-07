import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { userService } from "../services/users"
import { activitiesService } from "../services/activities"

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
      queryClient.invalidateQueries({ queryKey: ["current-user"] })
      return data
    },
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, any>({
    mutationFn: (data) => userService.login(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] })
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

  return useMutation<any, Error, any>({
    mutationFn: (activity_ids) => userService.addPreferencesBatch(activity_ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
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
