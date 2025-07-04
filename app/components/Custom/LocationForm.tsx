import { useStores } from "@/models"
import React, { useState } from "react"
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"
import MapView, { Marker } from "react-native-maps"

interface LocationFormProps {
  selectedCoordinates: { latitude: number; longitude: number } | null
  setSelectedCoordinates: (coordinates: { latitude: number; longitude: number } | null
    ) => void 
}

export default function LocationForm(
    {  selectedCoordinates, setSelectedCoordinates }: LocationFormProps
) {
  const fetchLocalidades = async (query: string) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query,
    )}&format=json&accept-language=es&countrycodes=ar&addressdetails=1&limit=5`

    const res = await fetch(url, {
      headers: { "User-Agent": "tu-app-ejemplo" },
    })

    return await res.json()
  }
  const { sessionStore } = useStores()

  const [query, setQuery] = useState("")
  const [sugerencias, setSugerencias] = useState<any[]>([])
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
    const data = await fetchLocalidades(text)
    setSugerencias(data)
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
    setSelectedCoordinates({ latitude: lat, longitude: lon })
  }

  return (
 <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <View style={{ padding: 8 }}>
          <TextInput
            placeholder="Buscar localidad"
            value={query}
            onChangeText={handleSearch}
            style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
          />
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={sugerencias}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item)} style={{ padding: 8 }}>
                <Text>{item.display_name}</Text>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 150, marginTop: 4 }}
          />
        </View>

        {/* <MapView
          style={{ flex: 1 }}
          region={region}
          pointerEvents="none"
        >
          {marker && <Marker coordinate={marker} />}
        </MapView> */}
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
})
