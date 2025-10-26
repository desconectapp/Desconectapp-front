import { useState, useEffect } from "react"
import { FlatList, TextInput, Text, TouchableOpacity, View, StyleSheet } from "react-native"
import { useSearchLocation } from "@/hooks/Map"
import Radar from "react-native-radar"

interface CustomAutocompleteProps {
  onSelection: (location: any) => void
  placeholder: string
}

const CustomAutocomplete = ({ onSelection, placeholder }: CustomAutocompleteProps) => {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null)
  
  const { data: locations, isLoading, isError } = useSearchLocation(
    debouncedQuery, 
    userLocation?.lat, 
    userLocation?.lon
  )

  // Get user location on mount
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const result = await Radar.getLocation()
        if (result.location) {
          setUserLocation({
            lat: result.location.latitude,
            lon: result.location.longitude
          })
          console.log(`[SearchBar] User location: ${result.location.latitude}, ${result.location.longitude}`)
        }
      } catch (error) {
        console.warn("Failed to get user location for search:", error)
      }
    }
    
    getUserLocation()
  }, [])

  // Debounce the query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query])

  // Show suggestions when we have data and the query is long enough
  useEffect(() => {
    setShowSuggestions(!!(locations && locations.length > 0 && debouncedQuery.length >= 3))
  }, [locations, debouncedQuery])

  const handleSelection = (location: any) => {
    setQuery("")
    setShowSuggestions(false)
    onSelection({
      id: `location-${location.lat}-${location.lon}`,
      name: location.location,
      address: location.address,
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
    })
  }

  const clearSearch = () => {
    setQuery("")
    setDebouncedQuery("")
    setShowSuggestions(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={(text) => {
            setQuery(text)
            if (text.length === 0) {
              setShowSuggestions(false)
            }
          }}
          placeholder={placeholder}
        />
        {query.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && locations && locations.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={locations}
            keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelection(item)}>
                <Text>{item.address}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      
      {isLoading && query.length >= 3 && (
        <View style={styles.loading}>
          <Text>Buscando...</Text>
        </View>
      )}
      
      {!isLoading && debouncedQuery.length >= 3 && (!locations || locations.length === 0) && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No se encontraron resultados</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
    paddingRight: 40, // Make room for clear button
  },
  clearButton: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "bold",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderTopWidth: 0,
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1001,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  loading: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderTopWidth: 0,
    borderRadius: 8,
    padding: 12,
    zIndex: 1001,
  },
  noResults: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderTopWidth: 0,
    borderRadius: 8,
    padding: 12,
    zIndex: 1001,
  },
  noResultsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
})

export default CustomAutocomplete
