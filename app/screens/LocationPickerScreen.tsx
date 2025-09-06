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
  type DimensionValue,
} from "react-native"
import { PanGestureHandler, State, TapGestureHandler } from "react-native-gesture-handler"
import { Screen, Text, Button } from "../components"
import { useAppTheme } from "@/utils/useAppTheme"

interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
}

interface NominatimResult {
  place_id: string
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

export function LocationPickerScreen() {
  const { themed } = useAppTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hasSelectedFromSuggestion, setHasSelectedFromSuggestion] = useState(false)
  const [mapRegion, setMapRegion] = useState({
    latitude: -34.6037, // Buenos Aires default
    longitude: -58.3816,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  })
  const [zoom, setZoom] = useState(13)

  // Separate marker position from map center
  const [markerPosition, setMarkerPosition] = useState<{ latitude: number; longitude: number } | null>(null)

  // Pan gesture state - simplified
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)

  // Gesture refs
  const singleTapRef = useRef<any>()
  const doubleTapRef = useRef<any>()
  const panRef = useRef<any>()

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
    if (markerPosition) {
      const screenPos = getPixelFromLatLon(markerPosition.latitude, markerPosition.longitude)
      markerScreenPosition = {
        left: screenPos.x - 12 + panOffset.x, // Center the marker (24px width / 2)
        top: screenPos.y - 24 + panOffset.y, // Position above the point (24px height)
      }
    }

    return (
      <View style={$mapContainer}>
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
            maxPointers={1}
            simultaneousHandlers={[panRef]}
          >
            <TapGestureHandler
              ref={singleTapRef}
              onActivated={onSingleTap}
              numberOfTaps={1}
              minPointers={1}
              maxPointers={1}
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
                {!markerPosition && <View style={$crosshair} />}

                {/* Selected location marker */}
                {markerPosition && markerScreenPosition && (
                  <View
                    style={[
                      $markerContainer,
                      {
                        left: markerScreenPosition.left,
                        top: markerScreenPosition.top,
                      },
                    ]}
                  >
                    <View style={$marker} />
                  </View>
                )}

                {/* Map info overlay */}
                <View style={$mapInfo}>
                  <Text style={$mapInfoText}>
                    {markerPosition
                      ? "Arrastra para navegar • Toca para cambiar • Dos dedos para zoom"
                      : "Arrastra para navegar • Toca para seleccionar • Dos dedos para zoom"}
                  </Text>
                </View>
              </View>
            </TapGestureHandler>
          </TapGestureHandler>
        </PanGestureHandler>

        {/* Zoom Controls */}
        <View style={$zoomControls}>
          <TouchableOpacity
            style={[$zoomButton, { borderBottomWidth: 1 }]}
            onPress={() => {
              const newZoom = Math.min(18, zoom + 1)
              setZoom(newZoom)
            }}
          >
            <Text style={$zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={$zoomButton}
            onPress={() => {
              const newZoom = Math.max(3, zoom - 1)
              setZoom(newZoom)
            }}
          >
            <Text style={$zoomButtonText}>-</Text>
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
    const location: Location = {
      id: suggestion.place_id,
      name: suggestion.name || suggestion.display_name.split(",")[0],
      latitude: Number.parseFloat(suggestion.lat),
      longitude: Number.parseFloat(suggestion.lon),
      address: suggestion.display_name,
    }
    setSelectedLocation(location)
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
    setSelectedLocation(null)
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
          id: `${latitude}-${longitude}`,
          name: data.name || data.display_name.split(",")[0] || "Ubicación seleccionada",
          latitude,
          longitude,
          address: data.display_name,
        }
        setSelectedLocation(location)
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
      setSelectedLocation(location)
      setSearchQuery(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
      setHasSelectedFromSuggestion(true)
    }
  }

  const handleNext = () => {
    if (selectedLocation) {
      Alert.alert("Ubicación seleccionada", selectedLocation.address)
      // navigation.navigate('NextScreen', { location: selectedLocation })
    }
  }

  const renderSuggestion = ({ item }: { item: NominatimResult }) => {
    const mainText = item.name || item.display_name.split(",")[0]
    const secondaryText = item.display_name.split(",").slice(1).join(",").trim()
    return (
      <TouchableOpacity style={$suggestionItem} onPress={() => handleSuggestionPress(item)}>
        <Text style={$suggestionMain}>{mainText}</Text>
        <Text style={$suggestionSecondary}>{secondaryText}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      <Text preset="heading" text="Selecciona una ubicación" style={$heading} />

      {/* Search Bar with Clear Button */}
      <View style={$searchContainer}>
        <View style={$searchInputContainer}>
          <TextInput
            style={$searchInput}
            placeholder="Buscar ubicación en Argentina..."
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            onFocus={handleSearchFocus}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={$clearButton} onPress={handleClearSearch}>
              <Text style={$clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Suggestions List */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={$suggestionsContainer}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.place_id}
              style={$suggestionsList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>

      {/* Custom OpenStreetMap */}
      {renderMap()}

      {/* Selected Location Info */}
      {selectedLocation && (
        <View style={$selectedLocationContainer}>
          <Text style={$selectedLocationTitle}>Ubicación seleccionada:</Text>
          <Text style={$selectedLocationName}>{selectedLocation.name}</Text>
          <Text style={$selectedLocationAddress}>{selectedLocation.address}</Text>
        </View>
      )}

      {/* Next Button */}
      <Button
        text="Siguiente"
        style={[$nextButton, selectedLocation ? $nextButtonEnabled : $nextButtonDisabled]}
        textStyle={[$nextButtonText, selectedLocation ? $nextButtonTextEnabled : $nextButtonTextDisabled]}
        disabled={!selectedLocation}
        onPress={handleNext}
      />
    </Screen>
  )
}

// Styles
const $container = { padding: 20 }
const $bottomContainerInsets = {}
const $screenBackground = "background"

const $heading = {
  marginBottom: 20,
  textAlign: "center" as const,
}

const $searchContainer = {
  position: "relative" as const,
  zIndex: 1000,
  marginBottom: 16,
}

const $searchInputContainer = {
  position: "relative" as const,
  flexDirection: "row" as const,
  alignItems: "center" as const,
}

const $searchInput = {
  flex: 1,
  height: 50,
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingRight: 50, // Make room for clear button
  backgroundColor: "#fff",
  fontSize: 16,
}

const $clearButton = {
  position: "absolute" as const,
  right: 12,
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: "#E5E5EA",
  justifyContent: "center" as const,
  alignItems: "center" as const,
}

const $clearButtonText = {
  fontSize: 18,
  color: "#8E8E93",
  fontWeight: "bold" as const,
}

const $suggestionsContainer = {
  position: "absolute" as const,
  top: 50,
  left: 0,
  right: 0,
  backgroundColor: "#fff",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#ddd",
  borderTopWidth: 0,
  maxHeight: 200,
}

const $suggestionsList = {
  maxHeight: 200,
}

const $suggestionItem = {
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
}

const $suggestionMain = {
  fontSize: 16,
  fontWeight: "500" as const,
  color: "#333",
}

const $suggestionSecondary = {
  fontSize: 14,
  color: "#666",
  marginTop: 2,
}

const $mapContainer = {
  height: 300,
  marginBottom: 16,
  borderRadius: 8,
  overflow: "hidden" as const,
  position: "relative" as const,
  backgroundColor: "#f0f0f0",
}

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

const $crosshair = {
  position: "absolute" as const,
  left: "50%" as DimensionValue,
  top: "50%" as DimensionValue,
  width: 20,
  height: 20,
  marginLeft: -10,
  marginTop: -10,
  borderWidth: 2,
  borderColor: "#007AFF",
  borderRadius: 10,
  backgroundColor: "rgba(0, 122, 255, 0.3)",
}

const $mapInfo = {
  position: "absolute" as const,
  bottom: 10,
  left: 10,
  right: 50,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  padding: 8,
  borderRadius: 6,
}

const $mapInfoText = {
  color: "#fff",
  fontSize: 12,
  textAlign: "center" as const,
}

const $markerContainer = {
  position: "absolute" as const,
}

const $marker = {
  width: 24,
  height: 24,
  backgroundColor: "#FF3B30",
  borderRadius: 12,
  borderWidth: 3,
  borderColor: "#fff",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
}

const $zoomControls = {
  position: "absolute" as const,
  right: 10,
  top: 10,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderRadius: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}

const $zoomButton = {
  width: 40,
  height: 40,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  borderBottomColor: "#eee",
}

const $zoomButtonText = {
  fontSize: 20,
  fontWeight: "600" as const,
  color: "#007AFF",
}

const $selectedLocationContainer = {
  backgroundColor: "#f8f9fa",
  padding: 16,
  borderRadius: 8,
  marginBottom: 20,
}

const $selectedLocationTitle = {
  fontSize: 14,
  fontWeight: "600" as const,
  color: "#666",
  marginBottom: 4,
}

const $selectedLocationName = {
  fontSize: 18,
  fontWeight: "600" as const,
  color: "#333",
  marginBottom: 4,
}

const $selectedLocationAddress = {
  fontSize: 14,
  color: "#666",
}

const $nextButton = {
  marginTop: 20,
  height: 50,
  borderRadius: 8,
}

const $nextButtonEnabled = {
  backgroundColor: "#007AFF",
}

const $nextButtonDisabled = {
  backgroundColor: "#E5E5EA",
}

const $nextButtonText = {
  fontSize: 18,
  fontWeight: "600" as const,
}

const $nextButtonTextEnabled = {
  color: "#fff",
}

const $nextButtonTextDisabled = {
  color: "#8E8E93",
}
