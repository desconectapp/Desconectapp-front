import { LocationIQAddress } from "@/services/mapApi/MapApi"

export function extractLocationName(address: LocationIQAddress): string {
      if (!address) {
        console.warn("No address found in LocationIQ response")
        return "Ubicacion no disponible"
      }

      const fieldsPriority = [
        "name",
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
      return address.display_name || "Ubicacion no disponible"
}