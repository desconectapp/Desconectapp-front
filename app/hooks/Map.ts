import { MapApiService } from "@/services/mapApi/MapApi"
import { useQuery } from "@tanstack/react-query"

export function useGetLocationName(latitude: number, longitude: number, enabled = true) {
  return useQuery({
    queryKey: ["locationName", latitude, longitude],
    queryFn: async () => {
      const response = await MapApiService.getLocationName(latitude, longitude)
      if (!response) throw new Error("Error al cargar el nombre de la ubicación")
      return response
    },
    enabled: enabled && latitude !== 0 && longitude !== 0,
  })
}

export function useSearchLocation(query: string, userLatitude?: number, userLongitude?: number) {
  return useQuery({
    queryKey: ["searchLocation", query, userLatitude, userLongitude],
    queryFn: async () => {
      const response = await MapApiService.searchLocation(query, userLatitude, userLongitude)
      if (!response) throw new Error("Error al buscar la ubicación")
      return response
    },
    enabled: query.length >= 3, // Only search when query has 3+ characters
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
    retry: 1, // Only retry once on failure
  })
}
