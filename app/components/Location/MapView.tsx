import { useStores } from "@/models"
import { useRef, useState } from "react"
import { Text, View, StyleSheet, Platform } from "react-native"
import MapLibreGL from "@maplibre/maplibre-react-native"
import { useEffect } from "react"
import Radar, { Map, Autocomplete } from "react-native-radar"
import {
  FlatList,
  LongPressGestureHandler,
  State,
  TextInput,
  TouchableOpacity,
} from "react-native-gesture-handler"
import CustomAutocomplete from "./SearchBar"
import { selectedLocation } from "types"
import { Icon } from "../Icon"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { LocationInfo } from "./LocationInfo"
import { CustomSlider } from "../Custom/CustomSlider"
// Initialize MapLibre
// MapLibreGL.setAccessToken(null) // No token needed for OpenStreetMap
const apiKey = process.env.EXPO_PUBLIC_RADAR_API_KEY || ""
if (!apiKey) {
  console.warn("RADAR_API_KEY is not set. Please set it in your .env file.")
} else {
  console.log("RADAR_API_KEY is set.")
}
Radar.initialize(apiKey)
MapLibreGL.setAccessToken(apiKey) // No token needed for OpenStreetMap

const BSASCOORDS = [-58.4173, -34.6118] // Buenos Aires coords

export interface MapMarker {
  id: string
  coordinates: [number, number] // [longitude, latitude]
  title?: string
  emoji?: string
  color?: string
  data?: any // additional data you want to store
  radius?: number // in degrees, approx 0.01 ~ 1km
}

export interface MapViewProps {
  selectedLocation?: selectedLocation | null
  setSelectedLocation?: (location: selectedLocation | null) => void
  initialZoom?: number
  searchRadiusKm?: number // in degrees, approx 0.01 ~ 1km
  setSearchRadiusKm?: (radiusKm: number) => void
  groups?: MapMarker[] // markers to display
  onGroupPress?: (marker: MapMarker) => void // callback when marker is pressed
  allowSelectLocation?: boolean // whether to allow adding markers via long press
  style?: any
}
export const MapViewComponent = ({
  selectedLocation,
  setSelectedLocation,
  searchRadiusKm = 0.01,
  setSearchRadiusKm,
  allowSelectLocation = false,
  groups = [],
  onGroupPress,

  style,
}: MapViewProps) => {
  const cameraRef = useRef<any>(null)
  const [cameraCenter, setCameraCenter] = useState<[number, number]>([BSASCOORDS[0], BSASCOORDS[1]]) // Default to Buenos Aires
  const [zoom, setZoom] = useState(13)
  
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [isSettingFromSearch, setIsSettingFromSearch] = useState(false)

  // Watch for selectedLocation changes and move camera
  useEffect(() => {
    if (selectedLocation && cameraRef.current) {
      // Set flag to prevent map onPress from clearing the selection
      setIsSettingFromSearch(true)
      
      // Move camera to new location
      setCameraCenter([selectedLocation.longitude, selectedLocation.latitude])
      setZoom(zoom < 14 ? 14 : zoom)
      
      // Clear the flag after a short delay
      setTimeout(() => {
        setIsSettingFromSearch(false)
      }, 500)
    }
  }, [selectedLocation])

  // LongPress selecciona una ubicacion
  const handleMapLongPress = async (event: any) => {
    if (!allowSelectLocation) return
    const coordinates = event.geometry.coordinates as [number, number]
    const address = await Radar.reverseGeocode({
      location: { latitude: coordinates[1], longitude: coordinates[0] },
    })
    setSelectedLocation?.({
      id: "selected-location",
      name: "Selected Location",
      address: address.addresses?.[0]?.formattedAddress || "Selected Location",
      latitude: coordinates[1],
      longitude: coordinates[0],
    })
    setCameraCenter?.(coordinates)
    setZoom(zoom < 13 ? 13 : zoom) // Zoom in if too far out
  }

  // Mostrar info de un marcador (grupo) al tocarlo
  const handleGroupPress = (marker: MapMarker) => {
    setSelectedMarker(marker)
    if (onGroupPress) {
      onGroupPress(marker)
    }
  }

  const getMarkerStyle = (marker: MapMarker) => ({
    backgroundColor: marker.color || "#FF0000",
    borderRadius: 15,
    width: marker.radius ? marker.radius * 2000 : 30,
    height: marker.radius ? marker.radius * 2000 : 30,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: "white",
  })

  // Helper function to create a circle geometry from center point and radius in km
  const createCircleGeoJSON = (center: [number, number], radiusKm: number) => {
    const points = 64 // Number of points to create the circle
    const coords = []
    
    // Convert km to degrees, accounting for latitude distortion
    const lat = center[1]
    const radiusLatDegrees = radiusKm / 111 // 1 degree latitude ≈ 111 km everywhere
    const radiusLngDegrees = radiusKm / (111 * Math.cos((lat * Math.PI) / 180)) // Longitude degrees vary by latitude
    
    for (let i = 0; i < points; i++) {
      const angle = (i * 360) / points
      const x = center[0] + radiusLngDegrees * Math.cos((angle * Math.PI) / 180)
      const y = center[1] + radiusLatDegrees * Math.sin((angle * Math.PI) / 180)
      coords.push([x, y])
    }
    
    // Close the polygon
    coords.push(coords[0])
    
    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "Polygon" as const,
        coordinates: [coords],
      },
    }
  }

  console.log("selected loc:",selectedLocation)
  return (
    <View style={[styles.container, style]}>
      <MapLibreGL.MapView
        style={styles.map}
        onLongPress={handleMapLongPress}
        mapStyle={`https://api.radar.io/maps/styles/radar-default-v1?publishableKey=${apiKey}`}
        onPress={() => {
          // Don't clear selection if it's being set from search
          if (!isSettingFromSearch) {
            setSelectedLocation?.(null)
            setSelectedMarker(null)
          }
        }} // Deselect marker when clicking on map
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          centerCoordinate={[cameraCenter[0], cameraCenter[1]]}
          zoomLevel={zoom}
          animationDuration={1000}
        />
        {selectedLocation && (
          <>
            {/* Search radius circle */}
            <MapLibreGL.ShapeSource
              id="search-radius-source"
              shape={createCircleGeoJSON(
                [selectedLocation.longitude, selectedLocation.latitude], 
                searchRadiusKm
              )}
            >
              <MapLibreGL.FillLayer
                id="search-radius-fill"
                style={{
                  fillColor: "rgba(85, 255, 136, 0.15)",
                  fillOpacity: 0.6,
                }}
              />
              <MapLibreGL.LineLayer
                id="search-radius-stroke"
                style={{
                  lineColor: "rgba(85, 255, 136, 0.8)",
                  lineWidth: 2,
                  lineOpacity: 0.8,
                }}
              />
            </MapLibreGL.ShapeSource>
            
            {/* Center marker */}
            <MapLibreGL.PointAnnotation
              key="user-location"
              id="user-location"
              coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
            >
              <View
                style={{
                  backgroundColor: "rgba(85, 255, 136, 1)",
                  borderRadius: 15,
                  width: 30,
                  height: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "white",
                }}
              >
                <Text style={{ fontSize: 16 }}>📍</Text>
              </View>
            </MapLibreGL.PointAnnotation>
          </>
        )}

        {/* Para ver grupos cercanos */}
        {/* {markers?.map((marker) => (
        <MapLibreGL.PointAnnotation
        key={marker.id}
        id={marker.id}
        coordinate={marker.coordinates}
        onSelected={() => handleMarkerPress(marker)}
        >
        <View style={getMarkerStyle(marker)}>
          {marker.emoji ? (
          <Text style={styles.markerEmoji}>{marker.title}{marker.emoji}</Text>
          ) : (
          <Text style={styles.markerText}>M</Text>
          )}
        </View>
        {marker.title ? (
          <MapLibreGL.Callout title={marker.title} />
        ) : <></>}
        </MapLibreGL.PointAnnotation>
      ))} */}
      </MapLibreGL.MapView>
      {/* Para cuando selecciono ubicacion en la search */}
      {selectedLocation && (
        <LocationInfo height={180}>
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16, paddingBottom: 15 }}>
            {selectedLocation.address || "Selected Location"}
          </Text>
          <View
            style={{
              width: 375,
              height: 100,

            }}
          >

            <CustomSlider
              value={searchRadiusKm}
              min={0.5}
              max={10}
              step={0.5}
              label="Radio de búsqueda"
              formatValue={(value) => `${value} km`}
              onValueChange={setSearchRadiusKm ?? (() => {})}
              showButtons={false}
              />
              </View>
        </LocationInfo>
      )}

      {/* Para cuando selecciono un grupo */}
      {/* Para el grupo, poner boton de entrar al grupo y eso */}
      {selectedMarker && (
        <LocationInfo>
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            {selectedMarker.title || "Marker"}
          </Text>
          {selectedMarker.emoji && <Text style={{ fontSize: 24 }}>{selectedMarker.emoji}</Text>}
          <Text style={{ color: "white", fontSize: 12 }}>
            Lat: {selectedMarker.coordinates[1].toFixed(5)}, Lon:{" "}
            {selectedMarker.coordinates[0].toFixed(5)}
          </Text>
          {selectedMarker.data && (
            <Text style={{ color: "white", fontSize: 12 }}>
              {JSON.stringify(selectedMarker.data)}
            </Text>
          )}
        </LocationInfo>
      )}
    </View>
  )
}

// Add styles for overlay and gradient
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerEmoji: {
    fontSize: 16,
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  bottomOverlayContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 100,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  gradientOverlay: {
    position: "absolute",
    left: 5,
    right: 5,
    bottom: 2.5,
    height: 100,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  selectedMarkerInfo: {
    padding: 16,
    alignItems: "center",
    zIndex: 2,
  },
})
