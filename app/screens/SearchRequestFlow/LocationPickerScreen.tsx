"use client"
import { useState, useEffect, useRef } from "react"
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  type DimensionValue,
  ViewStyle,
  TextStyle,
} from "react-native"
import { PanGestureHandler, State, TapGestureHandler } from "react-native-gesture-handler"
import { Screen, Text, Button, CustomSlider } from "../../components"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import {
  containers,
  buttons,
  buttonTexts,
  texts,
  inputs,
  chips,
  separators,
  shadows,
} from "@/theme/commonStyles"

import { MainStackParamList } from "@/navigators/MainNavigator"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { MapMarker, MapViewComponent } from "@/components/Location/MapView"
import CustomAutocomplete from "@/components/Location/SearchBar"
import { selectedLocation } from "types"



// interface NominatimResult {
//   place_id: string | number // Can be either string or number from API
//   display_name: string
//   lat: string
//   lon: string
//   name?: string
//   address?: {
//     city?: string
//     state?: string
//     country?: string
//   }
// }

type LocationPickerScreenProps = NativeStackScreenProps<MainStackParamList, "LocationPickerScreen">

export const LocationPickerScreen = observer(function LocationPickerScreen({
  route,
}: LocationPickerScreenProps) {
  const { nextScreen } = route.params || {}
  const { themed } = useAppTheme()
  const { requestStore } = useStores()
  const [searchQuery, setSearchQuery] = useState("")
  // const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<selectedLocation | null>(requestStore.location)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hasSelectedFromSuggestion, setHasSelectedFromSuggestion] = useState(false)
  const [mapRegion, setMapRegion] = useState({
    latitude: requestStore.location?.latitude || -34.6037, // Buenos Aires default
    longitude: requestStore.location?.longitude || -58.3816,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  })
  const [zoom, setZoom] = useState(13)
  const [radiusKm, setRadiusKm] = useState(requestStore.radiusKm || 5) // Use store value or default 5km

  // // Separate marker position from map center
  // const [markerPosition, setMarkerPosition] = useState<{
  //   latitude: number
  //   longitude: number
  // } | null>(
  //   requestStore.location
  //     ? { latitude: requestStore.location.latitude, longitude: requestStore.location.longitude }
  //     : null,
  // )

  // Pan gesture state - simplified
  // const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })

  // Helper function to update both local state and store
  // const updateSelectedLocation = (location: Location | null) => {
  //   try {
  //     console.log("Updating selected location:", location)
  //     setSelectedLocation(location)
  //     requestStore.setLocation(location)
  //     console.log("Successfully updated location in store")
  //   } catch (error) {
  //     console.error("Error updating location in store:", error)
  //     console.error("Location data that caused error:", location)
  //     Alert.alert("Error", "No se pudo guardar la ubicación seleccionada.")
  //   }
  // }

  // Helper function to update radius in both local state and store
  const updateRadius = (radius: number) => {
    markers.find
    setRadiusKm(radius)
    requestStore.setRadiusKm(radius)
  }
  const handleNext = () => {
    // Save selected location and radius to the store
    if (selectedLocation) {
      requestStore.setLocation(selectedLocation)
      requestStore.setRadiusKm(radiusKm)
    }

    navigation.navigate("SchedulePickerScreen" as any)
  }

  // const renderSuggestion = ({ item }: { item: NominatimResult }) => {
  //   const mainText = item.name || item.display_name.split(",")[0]
  //   const secondaryText = item.display_name.split(",").slice(1).join(",").trim()
  //   return (
  //     <TouchableOpacity style={themed($suggestionItem)} onPress={() => handleSuggestionPress(item)}>
  //       <Text style={themed(texts.body)}>{mainText}</Text>
  //       <Text style={themed(texts.bodySmall)}>{secondaryText}</Text>
  //     </TouchableOpacity>
  //   )
  // }

  const bsAsCoords: [number, number] = [-58.4173, -34.6118]
  const [cameraCenter, setCameraCenter] = useState<[number, number] | null>(bsAsCoords)
  const navigation = useNavigation<NativeStackScreenProps<MainStackParamList>["navigation"]>()
  const [markers, setMarkers] = useState<MapMarker[]>([
    {
      id: "marker-1",
      coordinates: [-73.9911, 40.7342],
      title: "Marker 1",
      emoji: "📍",
      color: "#FF0000",
      data: { additionalInfo: "Some data about Marker 1" },
    },
    {
      id: "marker-2",
      coordinates: [-73.9911, 40.8342],
      title: "Marker 2",
      emoji: "📍",
      color: "#0141f0ff",
      data: { additionalInfo: "Some data about Marker 2" },
    },
  ] as any[])

  // Get user's current location and set as cameraCenter on mount
  useEffect(() => {
    ;(async () => {
      try {
        // Request permission and get location
        const permissionStatus = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        })
        if (permissionStatus.state === "granted" || permissionStatus.state === "prompt") {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords: number[] = [position.coords.longitude, position.coords.latitude]
              setCameraCenter(coords)
              setSelectedLocation({
                id: "user-location",
                name: "Mi ubicación",
                latitude: coords[1],
                longitude: coords[0],
                address: "Ubicación actual",
              })
            },
            (error) => {
              console.warn("Error getting user location:", error)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
          )
        }
      } catch (e) {
        console.warn("Geolocation not available or permission denied")
      }
    })()
  }, [])

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={[{ flex: 1, padding: 0 }]}
      backgroundColor={themed($screenBackground)}
    >
      <View style={themed($header)}>
        <Text style={themed(texts.heading)}>Ubicación 📍</Text>
      </View>
      {/* Search Bar with Clear Button */}
      <View style={themed($searchContainer)}>
        <View style={themed($searchInputContainer)}>
         {/* Search Input */}
         <CustomAutocomplete
           placeholder="Buscar ubicación en Argentina..."
           onSelection={(address) => {
             console.log('Selected address:', address);
             setZoom(13) 
             setSelectedLocation({
               id: address.place_id ? String(address.place_id) : "unknown",
               name: address.name || address.formattedAddress.split(",")[0],
               latitude: address.latitude,
               longitude: address.longitude,
               address: address.formattedAddress,
             })
             const newMarker: MapMarker = {
               id: `marker-${markers.length + 1}`,
               coordinates: [address.longitude, address.latitude],
               title: address.name || address.formattedAddress.split(",")[0],
               emoji: "📍",
                color: "#FF0000",
                data: { additionalInfo: `Some data about Marker ${markers.length + 1}` },
              }
              setMarkers(prev => [...prev, newMarker]) 
            }
           }
         />
        </View>
      </View>

      <MapViewComponent
        markers={markers}
        location={selectedLocation}
        setLocation={setSelectedLocation}
        markerRadius={radiusKm * 0.01} // Convert km to degrees approx
        zoom={zoom}
        setZoom={setZoom}
        cameraCenter={cameraCenter}
        // onMarkerPress={(marker) => Alert.alert("Marker Pressed", `You pressed ${marker.title}`)}
        allowAddMarkers={true}
        onLongPress={(coords) => {
          console.log("Map long pressed at:", coords)
          const newMarker: MapMarker = {
            id: `marker-${markers.length + 1}`,
            coordinates: [coords[0], coords[1]],
            title: `Marker ${markers.length + 1}`,
            emoji: "📍",
            color: "#2bff00ff",
            data: { additionalInfo: `Some data about Marker ${markers.length + 1}` },
          }
          const markerRadius: MapMarker = {
            id: `radius-${markers.length + 1}`,
            coordinates: [coords[0], coords[1]],
            radius: radiusKm * 0.01, // in degrees
            color: "#0000ff22",
            data: { additionalInfo: `Radius for Marker ${markers.length + 1}` },
          }
          setMarkers([...markers, newMarker, markerRadius])
          setCameraCenter(coords)
          setTimeout(() => setCameraCenter(null), 1500)
        }}
      />
      <ScrollView
        style={themed($scrollView)}
        contentContainerStyle={themed($scrollContent)}
        keyboardShouldPersistTaps="handled"
      >
        {/* Radius Slider */}
        {selectedLocation && (
          <CustomSlider
            value={radiusKm}
            min={1}
            max={15}
            step={1}
            label="Radio de búsqueda"
            formatValue={(value) => `${value} km`}
            onValueChange={updateRadius}
            showButtons={true}
          />
        )}

        {/* Selected Location Info */}
        {selectedLocation && (
          <View style={[themed(containers.card), themed($selectedLocationContainer)]}>
            <Text style={themed(texts.caption)}>Ubicación seleccionada:</Text>
            <Text style={themed(texts.title)}>{selectedLocation.name}</Text>
            <Text style={themed(texts.bodySmall)}>{selectedLocation.address}</Text>
          </View>
        )}

        {/* Next Button */}
        <Button
          text="Siguiente"
          style={[
            themed(buttons.primary),
            themed($nextButton),
            !selectedLocation && themed(buttons.primaryDisabled),
          ]}
          textStyle={[
            themed(buttonTexts.primary),
            !selectedLocation && themed(buttonTexts.primaryDisabled),
          ]}
          disabled={!selectedLocation}
          onPress={handleNext}
        />
      </ScrollView>

      {/* Suggestions List - Outside ScrollView to avoid nesting VirtualizedList */}
      {/* {showSuggestions && suggestions.length > 0 && (
        <View
          style={[themed(containers.card), themed(shadows.medium), themed($suggestionsOverlay)]}
        >
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => String(item.place_id)}
            style={themed($suggestionsList)}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          />
        </View>
      )} */}
    </Screen>
  )
})

// Styled components using theming
const $screenBackground = "background"

const $scrollView = (theme: any): ViewStyle => ({
  flex: 1,
})

const $scrollContent = (theme: any): ViewStyle => ({
  padding: theme.spacing.sm, // Reducido de md a sm para menos padding
})

const $header = (theme: any): ViewStyle => ({
  alignItems: "center",
  marginBottom: theme.spacing.md,
})

const $searchContainer = (theme: any): ViewStyle => ({
  position: "relative",
  zIndex: 100,
  marginBottom: theme.spacing.sm,
})

const $searchInputContainer = (theme: any): ViewStyle => ({
  position: "relative",
  flexDirection: "row",
  alignItems: "center",
})

const $clearButton = (theme: any): ViewStyle => ({
  position: "absolute",
  right: 12,
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: theme.colors.backgroundMuted,
  justifyContent: "center",
  alignItems: "center",
})

const $clearButtonText = (theme: any): TextStyle => ({
  fontSize: 18,
  color: theme.colors.textDim,
  fontWeight: "bold",
})

const $suggestionsOverlay = (theme: any): ViewStyle => ({
  position: "absolute",
  top: 80, // Reducido de 100 para que esté más cerca del input
  left: theme.spacing.sm, // Reducido de md a sm
  right: theme.spacing.sm, // Reducido de md a sm
  maxHeight: 200,
  zIndex: 1000,
  elevation: 10,
})

const $suggestionsList = (theme: any): ViewStyle => ({
  maxHeight: 200,
})

const $suggestionItem = (theme: any): ViewStyle => ({
  padding: theme.spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
})

const $selectedLocationContainer = (theme: any): ViewStyle => ({
  marginBottom: theme.spacing.md,
})

const $nextButton = (theme: any): ViewStyle => ({
  marginTop: theme.spacing.md,
})
