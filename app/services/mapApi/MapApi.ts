import { extractLocationName } from '@/utils/mapApiUtils'
import locationIqClient from './locationIqClient'

export interface LocationIQAddress {
  town?: string
  neighbourhood?: string
  suburb?: string
  state_district?: string
  state?: string
  country?: string
  [key: string]: string | undefined
}

interface LocationIQResponse {
  address: LocationIQAddress
  display_name: string
  lat: string
  lon: string
}

interface SearchResult {
  location: string
  address: string
  lat: string
  lon: string
}

export const MapApiService = {
  /**
   * Get location name from coordinates using LocationIQ reverse geocoding API
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @returns Formatted location name (e.g., "Palermo, Buenos Aires, Argentina")
   */
  getLocationName: async (latitude: number, longitude: number): Promise<string | undefined> => {
    try {
      const response = await locationIqClient.get<LocationIQResponse>('/reverse', {
        lat: latitude,
        lon: longitude,
        format: 'json'
      })

      if (!response.ok) {
        console.error(`LocationIQ API error: ${response.status} ${response.problem}`)
        return undefined
      }

      const data = response.data
      if (!data) {
        console.warn("No data received from LocationIQ response")
        return undefined
      }
      return extractLocationName(data.address)
    } catch (error) {
      console.error("Error fetching location name:", error)
      return undefined
    }
  },

  searchLocation: async (
    query: string, 
    userLatitude?: number, 
    userLongitude?: number
  ): Promise<SearchResult[] | undefined> => {
    try {
      console.log(`[LocationIQ] Searching for: "${query}" with limit: 3`)
      
      const searchParams: any = {
        q: query,
        format: 'json',
        limit: 3,
        countrycodes: 'ar',
        addressdetails: 1,
      }

      // If user location is provided, create a viewbox within 100km radius
      if (userLatitude && userLongitude) {
        // 100km in degrees (approximately)
        const radiusInDegrees = 100 / 111 // 1 degree ≈ 111km
        const latRadius = radiusInDegrees
        const lonRadius = radiusInDegrees / Math.cos((userLatitude * Math.PI) / 180) // Account for latitude distortion

        const minLat = userLatitude - latRadius
        const maxLat = userLatitude + latRadius
        const minLon = userLongitude - lonRadius
        const maxLon = userLongitude + lonRadius

        // viewbox format: min_lon,min_lat,max_lon,max_lat
        searchParams.viewbox = `${minLon},${minLat},${maxLon},${maxLat}`
        searchParams.bounded = 1 // Restrict results to viewbox

        console.log(`[LocationIQ] Using viewbox: ${searchParams.viewbox}`)
      }

      const response = await locationIqClient.get<LocationIQResponse[]>('/search', searchParams)
      
      if (!response.ok) {
        console.error(`LocationIQ API error: ${response.status} ${response.problem}`)
        return undefined
      }


      const result = []
      result.push(...response.data!.map(item => ({
        location: extractLocationName(item.address),
        address: item.display_name,
        lat: item.lat,
        lon: item.lon,
      })))
      return result

    } catch (error) {
      console.error("Error searching location:", error)
      return undefined
    }
  }
}