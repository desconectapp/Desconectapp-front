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
import { Screen, Text, Button } from "../../components"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import { Slider } from "tamagui"
import { containers, buttons, buttonTexts, texts, inputs, chips, separators, shadows } from "@/theme/commonStyles"

import { MainStackParamList } from "@/navigators/MainNavigator"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { spacing } from "@/theme"

interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
}

interface NominatimResult {
  place_id: string | number // Can be either string or number from API
  display_name: string
  lat: string
  lon: string
  name?: string
  address?: {
    city?: string
    state?: string
    country?: string
  }
}

const { width } = Dimensions.get("window")

type LocationPickerScreenProps = NativeStackScreenProps<MainStackParamList, "LocationPickerScreen">

export const LocationPickerScreen = observer(function LocationPickerScreen({ route }: LocationPickerScreenProps) {
  const { nextScreen } = route.params || {}
  const { themed } = useAppTheme()
  const { requestStore } = useStores()
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    requestStore.location
  )
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

  // Separate marker position from map center
  const [markerPosition, setMarkerPosition] = useState<{ latitude: number; longitude: number } | null>(
    requestStore.location ? { latitude: requestStore.location.latitude, longitude: requestStore.location.longitude } : null
  )

  // Pan gesture state - simplified
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)

  // Gesture refs
  const singleTapRef = useRef<any>()
  const doubleTapRef = useRef<any>()
  const panRef = useRef<any>()

  // Helper function to update both local state and store
  const updateSelectedLocation = (location: Location | null) => {
    try {
      console.log("Updating selected location:", location)
      setSelectedLocation(location)
      requestStore.setLocation(location)
      console.log("Successfully updated location in store")
    } catch (error) {
      console.error("Error updating location in store:", error)
      console.error("Location data that caused error:", location)
      Alert.alert("Error", "No se pudo guardar la ubicación seleccionada.")
    }
  }

  // Helper function to update radius in both local state and store
  const updateRadius = (radius: number) => {
    setRadiusKm(radius)
    requestStore.setRadiusKm(radius)
  }

  // Helper functions for tile calculations
  const deg2rad = (deg: number) => deg * (Math.PI / 180)
  const rad2deg = (rad: number) => rad * (180 / Math.PI)

  const getTileX = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * Math.pow(2, z))
  const getTileY = (lat: number, z: number) =>
    Math.floor(((1 - Math.log(Math.tan(deg2rad(lat)) + 1 / Math.cos(deg2rad(lat))) / Math.PI) / 2) * Math.pow(2, z))

  const getTileUrl = (x: number, y: number, z: number) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`

  // Convert pixel coordinates to lat/lon based on current map center
  const getLatLonFromPixel = (pixelX: number, pixelY: number) => {
    const mapSize = 300

    // Calculate offset from center in pixels
    const offsetX = pixelX - mapSize / 2
    const offsetY = pixelY - mapSize / 2

    // Convert pixel offset to degrees
    const metersPerPixel = (40075016.686 * Math.cos(deg2rad(mapRegion.latitude))) / Math.pow(2, zoom + 8)
    const deltaLat = -(offsetY * metersPerPixel) / 111320 // meters to degrees latitude
    const deltaLon = (offsetX * metersPerPixel) / (111320 * Math.cos(deg2rad(mapRegion.latitude))) // meters to degrees longitude

    return {
      latitude: mapRegion.latitude + deltaLat,
      longitude: mapRegion.longitude + deltaLon,
    }
  }

  // Convert lat/lon to pixel coordinates relative to map center
  const getPixelFromLatLon = (lat: number, lon: number) => {
    const mapSize = 300

    // Calculate difference in degrees
    const deltaLat = lat - mapRegion.latitude
    const deltaLon = lon - mapRegion.longitude

    // Convert degrees to pixels
    const metersPerPixel = (40075016.686 * Math.cos(deg2rad(mapRegion.latitude))) / Math.pow(2, zoom + 8)
    const pixelX = (deltaLon * 111320 * Math.cos(deg2rad(mapRegion.latitude))) / metersPerPixel
    const pixelY = -(deltaLat * 111320) / metersPerPixel

    return {
      x: mapSize / 2 + pixelX,
      y: mapSize / 2 + pixelY,
    }
  }

  // Calculate radius in pixels based on kilometers
  const getRadiusInPixels = (radiusKm: number) => {
    const metersPerPixel = (40075016.686 * Math.cos(deg2rad(mapRegion.latitude))) / Math.pow(2, zoom + 8)
    const radiusInMeters = radiusKm * 1000
    return radiusInMeters / metersPerPixel
  }

  const onPanGestureEvent = (event: any) => {
    const { translationX, translationY } = event.nativeEvent
    setPanOffset({
      x: translationX,
      y: translationY,
    })
  }

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsPanning(true)
    } else if (event.nativeEvent.state === State.END) {
      setIsPanning(false)
      const { translationX, translationY } = event.nativeEvent

      // Update map region based on pan translation
      const metersPerPixel = (40075016.686 * Math.cos(deg2rad(mapRegion.latitude))) / Math.pow(2, zoom + 8)
      const deltaLat = (translationY * metersPerPixel) / 111320
      const deltaLon = -(translationX * metersPerPixel) / (111320 * Math.cos(deg2rad(mapRegion.latitude)))

      setMapRegion((prev) => ({
        ...prev,
        latitude: prev.latitude + deltaLat,
        longitude: prev.longitude + deltaLon,
      }))

      // Reset pan offset
      setPanOffset({ x: 0, y: 0 })
    }
  }

  // Handle single tap for location selection
  const onSingleTap = (event: any) => {
    if (!isPanning) {
      // const { x, y } = event.nativeEvent
      // const coords = getLatLonFromPixel(x, y)
      // setMarkerPosition(coords)
      // reverseGeocode(coords.latitude, coords.longitude)
    }
  }

  // Handle two-finger tap for zoom
  const onDoubleTap = (event: any) => {
    console.log("Double tap detected")
      const { x, y } = event.nativeEvent
      const coords = getLatLonFromPixel(x, y)
      setMarkerPosition(coords)
      reverseGeocode(coords.latitude, coords.longitude)
  }

  const renderMap = () => {
    const centerTileX = getTileX(mapRegion.longitude, zoom)
    const centerTileY = getTileY(mapRegion.latitude, zoom)

    // Calculate tile offset based on exact position within tile
    const exactTileX = ((mapRegion.longitude + 180) / 360) * Math.pow(2, zoom)
    const exactTileY =
      ((1 - Math.log(Math.tan(deg2rad(mapRegion.latitude)) + 1 / Math.cos(deg2rad(mapRegion.latitude))) / Math.PI) /
        2) *
      Math.pow(2, zoom)

    const tileOffsetX = (exactTileX - centerTileX) * 256
    const tileOffsetY = (exactTileY - centerTileY) * 256

    // Calculate which tiles to show (3x3 grid)
    const tiles = []
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        const tileX = centerTileX + x
        const tileY = centerTileY + y

        if (tileX >= 0 && tileY >= 0 && tileX < Math.pow(2, zoom) && tileY < Math.pow(2, zoom)) {
          tiles.push({
            x: tileX,
            y: tileY,
            url: getTileUrl(tileX, tileY, zoom),
            style: {
              position: "absolute" as const,
              left: 150 + x * 256 - tileOffsetX + panOffset.x,
              top: 150 + y * 256 - tileOffsetY + panOffset.y,
              width: 256,
              height: 256,
            },
          })
        }
      }
    }

    // Calculate marker position on screen if we have a selected location
    let markerScreenPosition = null
    let radiusPixels = 0
    if (markerPosition) {
      const screenPos = getPixelFromLatLon(markerPosition.latitude, markerPosition.longitude)
      radiusPixels = getRadiusInPixels(radiusKm)
      markerScreenPosition = {
        left: screenPos.x - 12 + panOffset.x, // Center the marker (24px width / 2)
        top: screenPos.y - 24 + panOffset.y, // Position above the point (24px height)
        radiusLeft: screenPos.x - radiusPixels + panOffset.x, // Center the radius circle
        radiusTop: screenPos.y - radiusPixels + panOffset.y,
      }
    }

    return (
      <View style={themed($mapContainer)}>
        <PanGestureHandler
          ref={panRef}
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanHandlerStateChange}
          simultaneousHandlers={[singleTapRef, doubleTapRef]}
        >
          <TapGestureHandler
            ref={doubleTapRef}
            onActivated={onDoubleTap}
            numberOfTaps={2}
            minPointers={1}
            simultaneousHandlers={[panRef]}
          >
            <TapGestureHandler
              ref={singleTapRef}
              onActivated={onSingleTap}
              numberOfTaps={1}
              minPointers={1}
              waitFor={doubleTapRef}
              simultaneousHandlers={[panRef]}
            >
              <View style={$mapTouchable}>
                <View style={$tilesContainer}>
                  {tiles.map((tile, index) => (
                    <Image
                      key={`${tile.x}-${tile.y}-${index}`}
                      source={{
                        uri: tile.url,
                        headers: {
                          "User-Agent": "LocationPickerApp/1.0",
                        },
                      }}
                      style={tile.style}
                      resizeMode="cover"
                      onError={(error) => {
                        console.warn("Tile loading error:", error.nativeEvent.error)
                      }}
                    />
                  ))}
                </View>

                {/* Center crosshair - only show when no location is selected */}
                {!markerPosition && <View style={themed($crosshair)} />}

                {/* Selected location marker */}
                {markerPosition && markerScreenPosition && (
                  <>
                    {/* Radius circle */}
                    <View
                      style={[
                        themed($radiusOutlineMarker),
                        {
                          left: markerScreenPosition.radiusLeft,
                          top: markerScreenPosition.radiusTop,
                          width: radiusPixels * 2,
                          height: radiusPixels * 2,
                          borderRadius: radiusPixels,
                        },
                      ]}
                    />
                    {/* Marker pin */}
                    <View
                      style={[
                        $markerContainer,
                        {
                          left: markerScreenPosition.left,
                          top: markerScreenPosition.top,
                        },
                      ]}
                    >
                      <View style={themed($marker)} />
                    </View>
                  </>
                )}

                {/* Map info overlay */}
                <View style={themed($mapInfo)}>
                  <Text style={[themed(texts.caption), { color: "#fff" }]}>
                      Arrastra para navegar • Toca dos veces para seleccionar
                  </Text>
                </View>
              </View>
            </TapGestureHandler>
          </TapGestureHandler>
        </PanGestureHandler>

        {/* Zoom Controls */}
        <View style={[themed(containers.card), themed($zoomControls)]}>
          <TouchableOpacity
            style={[themed($zoomButton), { borderBottomWidth: 1, borderBottomColor: themed(separators.horizontal).backgroundColor }]}
            onPress={() => {
              const newZoom = Math.min(18, zoom + 1)
              setZoom(newZoom)
            }}
          >
            <Text style={themed($zoomButtonText)}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={themed($zoomButton)}
            onPress={() => {
              const newZoom = Math.max(3, zoom - 1)
              setZoom(newZoom)
            }}
          >
            <Text style={themed($zoomButtonText)}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Debounced search for places using Nominatim
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    // Only search if user is actively typing (not from suggestion selection)
    if (searchQuery.length > 2 && !hasSelectedFromSuggestion) {
      searchTimeoutRef.current = setTimeout(() => {
        searchPlaces(searchQuery)
      }, 500)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, hasSelectedFromSuggestion])

  const searchPlaces = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&countrycodes=ar&limit=5&addressdetails=1`,
        {
          headers: {
            "User-Agent": "LocationPickerApp/1.0",
          },
        },
      )
      const data = await response.json()
      if (data && Array.isArray(data)) {
        setSuggestions(data)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error("Error searching places:", error)
      setSuggestions([])
    }
  }

  const handleSuggestionPress = (suggestion: NominatimResult) => {
    try {
      console.log("Suggestion data:", suggestion)
      
      // Validate lat/lon values
      const latitude = Number.parseFloat(suggestion.lat)
      const longitude = Number.parseFloat(suggestion.lon)
      
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Invalid latitude or longitude values")
      }
      
      const location: Location = {
        id: String(suggestion.place_id), // Ensure it's always a string
        name: suggestion.name || suggestion.display_name.split(",")[0],
        latitude,
        longitude,
        address: suggestion.display_name,
      }
      
      console.log("Created location object:", location)
      
      updateSelectedLocation(location)
      setSearchQuery(suggestion.display_name)
      setShowSuggestions(false)
      setHasSelectedFromSuggestion(true)

      // Center map on selected location
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      })

      // Set marker position
      setMarkerPosition({
        latitude: location.latitude,
        longitude: location.longitude,
      })

      // Reset pan offsets when jumping to new location
      setPanOffset({ x: 0, y: 0 })
    } catch (error) {
      console.error("Error handling suggestion press:", error)
      console.error("Suggestion that caused error:", suggestion)
      Alert.alert("Error", "No se pudo seleccionar esta ubicación. Por favor intenta con otra.")
    }
  }

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text)
    setHasSelectedFromSuggestion(false)
  }

  const handleSearchFocus = () => {
    if (suggestions.length > 0 && !hasSelectedFromSuggestion) {
      setShowSuggestions(true)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setHasSelectedFromSuggestion(false)
    setSuggestions([])
    setShowSuggestions(false)
    updateSelectedLocation(null)
    setMarkerPosition(null)
  }

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            "User-Agent": "LocationPickerApp/1.0",
          },
        },
      )
      const data = await response.json()
      if (data && data.display_name) {
        const location: Location = {
          id: String(data.place_id || `${latitude}-${longitude}`), // Ensure it's always a string
          name: data.name || data.display_name.split(",")[0] || "Ubicación seleccionada",
          latitude,
          longitude,
          address: data.display_name,
        }
        updateSelectedLocation(location)
        setSearchQuery(data.display_name)
        setHasSelectedFromSuggestion(true)
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error)
      const location: Location = {
        id: `${latitude}-${longitude}`,
        name: "Ubicación seleccionada",
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      }
      updateSelectedLocation(location)
      setSearchQuery(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
      setHasSelectedFromSuggestion(true)
    }
  }

  const handleNext = () => {
    // Save selected location and radius to the store
    if (selectedLocation) {
      requestStore.setLocation(selectedLocation)
      requestStore.setRadiusKm(radiusKm)
    }

    navigation.navigate("SchedulePickerScreen" as any)
  }

  const renderSuggestion = ({ item }: { item: NominatimResult }) => {
    const mainText = item.name || item.display_name.split(",")[0]
    const secondaryText = item.display_name.split(",").slice(1).join(",").trim()
    return (
      <TouchableOpacity style={themed($suggestionItem)} onPress={() => handleSuggestionPress(item)}>
        <Text style={themed(texts.body)}>{mainText}</Text>
        <Text style={themed(texts.bodySmall)}>{secondaryText}</Text>
      </TouchableOpacity>
    )
  }
  
  const navigation = useNavigation<NativeStackScreenProps<MainStackParamList>["navigation"]>()
  
  return (
    <Screen
      preset="fixed"
      contentContainerStyle={[themed(containers.screen)]}
      backgroundColor={themed($screenBackground)}
    >
      
      <ScrollView 
        style={themed($scrollView)}
        contentContainerStyle={themed($scrollContent)}
        keyboardShouldPersistTaps="handled"
      >
        <View style={themed($header)}>
          <Text style={themed(texts.heading)}>
            ¿Por dónde?
          </Text>                      
        </View>

        {/* Search Bar with Clear Button */}
        <View style={themed($searchContainer)}>
          <View style={themed($searchInputContainer)}>
            <TextInput
              style={[themed(inputs.base), themed(inputs.text)]}
              placeholder="Buscar ubicación en Argentina..."
              placeholderTextColor={themed(texts.caption).color}
              value={searchQuery}
              onChangeText={handleSearchInputChange}
              onFocus={handleSearchFocus}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity style={themed($clearButton)} onPress={handleClearSearch}>
                <Text style={themed($clearButtonText)}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Custom OpenStreetMap */}
        {renderMap()}

        {/* Radius Slider */}
        {selectedLocation && (
          <View style={[themed(containers.section), themed($radiusContainer)]}>
            <Text style={themed(texts.label)}>Radio de búsqueda: {radiusKm} km</Text>

            {radiusKm > 10 ? (
              <Text style={themed(texts.caption)}>Capaz que me tomo un avión</Text>
            ) : radiusKm > 5 ? (
              <Text style={themed(texts.caption)}>Viajo en tren también</Text>
            ) : radiusKm > 1 ? (
              <Text style={themed(texts.caption)}>Viajo en bondi</Text>
            ) : null}

            <Slider 
              size="$2" 
              width={"100%"} 
              value={[radiusKm]} 
              onValueChange={(value) => updateRadius(value[0])}
              max={15} 
              min={1}
              step={1}
            >
              <Slider.Track>
                <Slider.TrackActive />
              </Slider.Track>
              <Slider.Thumb circular index={0} />
            </Slider>
          </View>
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
            !selectedLocation && themed(buttons.primaryDisabled)
          ]}
          textStyle={[
            themed(buttonTexts.primary),
            !selectedLocation && themed(buttonTexts.primaryDisabled)
          ]}
          disabled={!selectedLocation}
          onPress={handleNext}
        />
      </ScrollView>

      {/* Suggestions List - Outside ScrollView to avoid nesting VirtualizedList */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={[themed(containers.card), themed(shadows.medium), themed($suggestionsOverlay)]}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => String(item.place_id)}
            style={themed($suggestionsList)}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          />
        </View>
      )}
    </Screen>
  )
})

// Styled components using theming
const $screenBackground = "background"

const $scrollView = (theme: any): ViewStyle => ({
  flex: 1,
})

const $scrollContent = (theme: any): ViewStyle => ({
  padding: theme.spacing.lg,
})

const $header = (theme: any): ViewStyle => ({
  alignItems: "center",
  marginBottom: theme.spacing.lg,
})

const $searchContainer = (theme: any): ViewStyle => ({
  position: "relative",
  zIndex: 100,
  marginBottom: theme.spacing.md,
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
  top: 100, // Position below search bar
  left: theme.spacing.lg,
  right: theme.spacing.lg,
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

const $mapContainer = (theme: any): ViewStyle => ({
  height: 300,
  marginBottom: theme.spacing.md,
  borderRadius: theme.spacing.sm,
  overflow: "hidden",
  position: "relative",
  backgroundColor: theme.colors.backgroundMuted,
})

const $mapTouchable = {
  flex: 1,
  position: "relative" as const,
}

const $tilesContainer = {
  position: "absolute" as const,
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
}

const $crosshair = (theme: any): ViewStyle => ({
  position: "absolute",
  left: "50%" as DimensionValue,
  top: "50%" as DimensionValue,
  width: 20,
  height: 20,
  marginLeft: -10,
  marginTop: -10,
  borderWidth: 2,
  borderColor: theme.colors.tint,
  borderRadius: 10,
  backgroundColor: `${theme.colors.tint}33`, // 20% opacity
})

const $mapInfo = (theme: any): ViewStyle => ({
  position: "absolute",
  bottom: 10,
  left: 10,
  right: 50,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  padding: theme.spacing.xs,
  borderRadius: theme.spacing.xs,
})

const $markerContainer = {
  position: "absolute" as const,
}

const $marker = (theme: any): ViewStyle => ({
  width: 24,
  height: 24,
  backgroundColor: theme.colors.error,
  borderRadius: 12,
  borderWidth: 3,
  borderColor: theme.colors.background,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
})

const $radiusOutlineMarker = (theme: any): ViewStyle => ({
  position: "absolute",
  backgroundColor: `${theme.colors.error}40`, // 25% opacity
  borderWidth: 2,
  borderColor: `${theme.colors.error}80`, // 50% opacity
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
})

const $radiusContainer = (theme: any): ViewStyle => ({
  marginBottom: theme.spacing.md,
})

const $zoomControls = (theme: any): ViewStyle => ({
  position: "absolute",
  right: 10,
  top: 10,
  padding: 0,
  margin: 0,
})

const $zoomButton = (theme: any): ViewStyle => ({
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
})

const $zoomButtonText = (theme: any): TextStyle => ({
  fontSize: 20,
  fontWeight: "600",
  color: theme.colors.tint,
})

const $selectedLocationContainer = (theme: any): ViewStyle => ({
  marginBottom: theme.spacing.lg,
})

const $nextButton = (theme: any): ViewStyle => ({
  marginTop: theme.spacing.lg,
})
