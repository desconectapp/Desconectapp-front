import { api } from "../api"
import { Activity } from "./Activities.types"

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
    console.log("Preferencias obtenidas:", response.data)
    return response.data
  },
}
