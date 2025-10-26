const LOCATION_IQ_API_KEY = process.env.EXPO_PUBLIC_LOCATION_IQ_API_KEY || ""

export const MapApiService = {
  /**
   * Get location name from coordinates using Radar reverse geocoding API
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @returns Formatted location name (e.g., "Palermo")
   */
  getLocationName: async (latitude: number, longitude: number): Promise<string | undefined> => {
    try {
      if (!LOCATION_IQ_API_KEY) {
        console.warn("EXPO_PUBLIC_LOCATION_IQ_API_KEY is not set. Cannot fetch location name.")
        return undefined
      }

      const url = `https://us1.locationiq.com/v1/reverse?key=${LOCATION_IQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": LOCATION_IQ_API_KEY,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error(`Radar API error: ${response.status} ${response.statusText}`)
        return undefined
      }

      const data = await response.json()
      
      // Extract location name from response
      // Priority: town > neighbourhood > suburb > state_district > state > country
      const address = data.address
      if (!address) {
        console.warn("No address found in LocationIQ response")
        return undefined
      }

      const fieldsPriority = [
        "town",
        "neighbourhood",
        "suburb",
        "state_district",
        "state",
        "country",
      ]

      for (const key of fieldsPriority) {
        if (address[key] && typeof address[key] === "string" && address[key] !== "") {
          return address[key]
        }
      }

      // Fallback to display_name if no priority field found
      return data.display_name || undefined
	
    } catch (error) {
      console.error("Error fetching location name:", error)
      return undefined
    }
  },
}