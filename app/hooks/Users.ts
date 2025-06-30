import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { userService } from "../services/users"

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] })
    },
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, any>({
    mutationFn: (data) => userService.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] })
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

export const usePreferences = () => {
  return useQuery({
    queryKey: ["preferences"],
    queryFn: async () => {
      const response = await userService.getPreferences()
      if (!response) throw new Error("Error al cargar preferencias")
      return response
    },
  })
}
