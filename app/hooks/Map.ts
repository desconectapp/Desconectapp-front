import { MapApiService } from "@/services/mapApi/MapApi"
import { useQuery } from "@tanstack/react-query"

export default function useGetLocationName(latitude: number, longitude: number) {
  return useQuery({
    queryKey: ["locationName", latitude, longitude],
    queryFn: async () => {
      const response = await MapApiService.getLocationName(latitude, longitude)
      if (!response) throw new Error("Error al cargar el nombre de la ubicación")
      return response
    },
  })
}
