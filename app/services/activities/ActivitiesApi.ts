import { api } from "../api"
import { Activity, ActivityRequest } from "./Activities.types"

export const activitiesService = {
  getActivities: async (
    limit: number = 10,
    offset: number = 0,
  ): Promise<Activity[] | undefined> => {
    const response = await api.apisauce.get<Activity[] | undefined>("/activities", {
      limit,
      offset,
    })
    if (!response.ok) {
      throw new Error("Error al cargar preferencias")
    }
    return response.data
  },

  getActivitiesFromUser: async (): Promise<Activity[] | undefined> => {
    const response = await api.apisauce.get<Activity[] | undefined>("/preferences", {
      limit: 1000,
      offset: 0,
    })
    if (!response.ok) {
      throw new Error("Error al cargar preferencias")
    }
    console.log("Preferencias del usuario obtenidas:", response.data)
    return response.data
  },

  getActivityRequests: async (
    limit: number = 10,
    offset: number = 0,
  ): Promise<ActivityRequest[] | undefined> => {
    const response = await api.apisauce.get<ActivityRequest[] | undefined>("/activities/request", {
      limit,
      offset,
    })
    if (!response.ok) {
      throw new Error("Error al cargar solicitudes de actividades")
    }
    return response.data
  },
}
