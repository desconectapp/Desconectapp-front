import { api } from "../api"
import { Activity, ActivityRequest } from "./Activities.types"

export const activitiesService = {
  getActivities: async (
    limit: number = 10,
    offset: number = 0,
    query: string = "",
  ): Promise<Activity[] | undefined> => {
    const response = await api.apisauce.get<Activity[] | undefined>("/activities", {
      limit,
      offset,
      q: query,
    })
    if (!response.ok) {
      throw new Error("Error al cargar preferencias")
    }
    return response.data
  },

  getActivitiesFromUser: async (): Promise<{ preferences: Activity[]; has_more: boolean } | undefined> => {
    const response = await api.apisauce.get<{ preferences: Activity[]; has_more: boolean } | undefined>("/preferences", {
      limit: 1000,
      offset: 0,
    })
    if (!response.ok) {
      throw new Error("Error al cargar preferencias")
    }
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
    console.log("req reponse:", response.data);

    if (!response.ok) {
      throw new Error("Error al cargar solicitudes de actividades")
    }
    return response.data
  },
}
