import React, { useState, useEffect } from "react"
import { View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform } from "react-native"
import MapView, { Marker } from "react-native-maps"

export default function SimpleLocationForm() {
  const [mapReady, setMapReady] = useState(false)
  
  const fetchLocalidades = async (query: string) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&accept-language=es&countrycodes=ar&addressdetails=1&limit=5`

    const res = await fetch(url, {
      headers: { "User-Agent": "tu-app-ejemplo" },
    })

    return await res.json()
  }

  const [query, setQuery] = useState("")
  const [sugerencias, setSugerencias] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [region, setRegion] = useState({
    latitude: -34.6037, // Buenos Aires por defecto
    longitude: -58.3816,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  })
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null)

  const handleSearch = async (text: string) => {
    setQuery(text)
    if (text.length < 3) {
      setSugerencias([])
      return
    }
    try {
      const data = await fetchLocalidades(text)
      setSugerencias(data)
    } catch (error) {
      console.error("Error fetching locations:", error)
      setSugerencias([])
    }
  }

  const handleSelect = (item: any) => {
    const lat = parseFloat(item.lat)
    const lon = parseFloat(item.lon)
    setRegion({
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    })
    setMarker({ latitude: lat, longitude: lon })
    setSugerencias([])
    setQuery(item.display_name)
    setSelectedLocation(item.display_name)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.searchSection}>
          <TextInput
            placeholder="Buscar localidad"
            value={query}
            onChangeText={handleSearch}
            style={styles.input}
          />
          {sugerencias.length > 0 && (
            <View style={styles.suggestionsList}>
              {sugerencias.map((item) => (
                <TouchableOpacity 
                  key={item.place_id.toString()}
                  onPress={() => handleSelect(item)} 
                  style={styles.suggestion}
                >
                  <Text style={styles.suggestionText}>{item.display_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {selectedLocation !== "" && (
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedLabel}>Ubicación seleccionada:</Text>
              <Text style={styles.selectedText}>{selectedLocation}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onMapReady={() => setMapReady(true)}
            onRegionChangeComplete={setRegion}
            onPress={(e) => {
              if (mapReady) {
                setMarker(e.nativeEvent.coordinate)
              }
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={false}
            rotateEnabled={false}
            moveOnMarkerPress={false}
            toolbarEnabled={false}
          >
            {marker && mapReady && (
              <Marker 
                coordinate={marker} 
                title="Ubicación seleccionada"
                draggable={false}
              />
            )}
          </MapView>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    padding: 8,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  suggestionsList: {
    maxHeight: 150,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  suggestion: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
  },
  selectedContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
  selectedLabel: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  selectedText: {
    fontSize: 14,
    color: "#666",
  },
  mapContainer: {
    flex: 1,
    minHeight: 300,
  },
  map: {
    flex: 1,
  },
})
