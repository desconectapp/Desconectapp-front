import { useRef, useState } from "react"
import { Text, View, StyleSheet, Alert, Platform, PermissionsAndroid, Image } from "react-native"
import MapLibreGL from "@maplibre/maplibre-react-native"
import { useEffect } from "react"
import Radar from "react-native-radar"
import {
  TouchableOpacity,
} from "react-native-gesture-handler"
import { selectedLocation } from "types"
import { LocationInfo } from "./LocationInfo"
import { CustomSlider } from "../Custom/CustomSlider"
import { MapGroup } from "@/services/groups/Groups.types"
import { GroupMapIcon } from "./GroupMapIcon"
import { GroupMapInfoCard } from "./GroupMapInfoCard"


const apiKey = process.env.EXPO_PUBLIC_RADAR_API_KEY || ""
if (!apiKey) {
  console.warn("RADAR_API_KEY is not set. Please set it in your .env file.")
}
Radar.initialize(apiKey)
MapLibreGL.setAccessToken(apiKey) // No token needed for OpenStreetMap

const BSASCOORDS = [-58.4173, -34.6118] // Buenos Aires coords


export interface MapViewProps {
  // Para busqueda de grupo
  selectedLocation?: selectedLocation | null
  setSelectedLocation?: (location: selectedLocation | null) => void
  searchRadiusKm?: number
  setSearchRadiusKm?: (radiusKm: number) => void
  allowSelectLocation?: boolean // whether to allow adding markers via long press
  
  // Para ver grupos cercanos
  groups?: MapGroup[] 
  onGroupPress?: (group: MapGroup) => void // callback when marker is pressed
  onRegionChange?: (center: [number, number], radiusKm: number) => void // callback for region changes
  enableDynamicFetch?: boolean // enable dynamic fetching based on map region
  
  // Otras props
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
  onRegionChange,
  enableDynamicFetch = false,

  style,
}: MapViewProps) => {
  const cameraRef = useRef<any>(null)
  const [cameraCenter, setCameraCenter] = useState<[number, number]>([BSASCOORDS[0], BSASCOORDS[1]]) // Default to Buenos Aires
  const [zoom, setZoom] = useState(13)
  
  console.log("MapView render - Camera center:", cameraCenter, "Zoom:", zoom)

  const [selectedMarker, setSelectedMarker] = useState<MapGroup | null>(null)
  const [isSettingFromSearch, setIsSettingFromSearch] = useState(false)

  // Simple location setup on mount
  useEffect(() => {
    const setupLocation = async () => {
      try {
        let granted = false
        
        if (Platform.OS === 'android') {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location to show nearby groups',
              buttonPositive: 'OK',
            }
          )
          granted = result === PermissionsAndroid.RESULTS.GRANTED
        } else {
          granted = true // iOS handles permission through geolocation call
        }

        if (granted) {
          try {
            const result = await Radar.getLocation()
            if (result.location) {
              const coords: [number, number] = [result.location.longitude, result.location.latitude]
              console.log("Got user location:", coords)
              
              if (enableDynamicFetch && cameraRef.current) {
                // Uncontrolled mode: set camera directly
                cameraRef.current.setCamera({
                  centerCoordinate: coords,
                  zoomLevel: 13,
                  animationDuration: 0,
                })
              } else {
                // Controlled mode: update state
                setCameraCenter(coords)
              }
            } else {
              console.warn("No location returned from Radar, using fallback")
            }
          } catch (error) {
            console.warn("Location error, using fallback:", error)
            // Fallback is already set in initial state
          }
        } else {
          console.log("Location permission denied, using fallback")
          // Fallback is already set in initial state
        }
      } catch (error) {
        console.warn("Location setup error, using fallback:", error)
        // Fallback is already set in initial state
      }
    }

    setupLocation()
  }, [enableDynamicFetch])

  // Convert zoom level to approximate radius in km
  const zoomToRadiusKm = (zoomLevel: number): number => {
    // Approximate formula: higher zoom = smaller radius
    // Expanded radius - Zoom 10 ≈ 40km, Zoom 12 ≈ 10km, Zoom 14 ≈ 2.5km, Zoom 16 ≈ 0.8km
    return Math.max(0.8, 80 / Math.pow(2, zoomLevel - 8))
  }

  // Handle map region changes for dynamic fetching
  const handleRegionDidChange = (region: any) => {
    if (!enableDynamicFetch || !onRegionChange) return
    
    console.log("Region changed:", region)
    
    // Validate region object - it's a GeoJSON Feature
    if (!region || !region.geometry || !region.properties) {
      console.warn("Invalid region object structure:", region)
      return
    }
    
    // Extract coordinates and zoom level from GeoJSON structure
    const coordinates = region.geometry.coordinates
    const zoomLevel = region.properties.zoomLevel
    
    if (!Array.isArray(coordinates) || coordinates.length < 2 || typeof zoomLevel !== 'number') {
      console.warn("Invalid coordinates or zoom level:", { coordinates, zoomLevel })
      return
    }
    
    const minZoomForFetch = 11 // Don't fetch if zoom is too low (too much area)
    if (zoomLevel < minZoomForFetch) {
      console.log(`Zoom level ${zoomLevel} too low, skipping fetch`)
      return
    }

    const center: [number, number] = [
      parseFloat(coordinates[0]) || 0, // longitude
      parseFloat(coordinates[1]) || 0  // latitude
    ]
    const radiusKm = zoomToRadiusKm(zoomLevel)
    
    console.log(`Region change - Center: [${center[0]}, ${center[1]}], Zoom: ${zoomLevel}, Radius: ${radiusKm}km`)
    
    // Trigger callback for fetching groups
    // Note: We don't update internal camera state here to avoid interfering with user navigation
    onRegionChange(center, radiusKm)
  }

  // Watch for selectedLocation changes and move camera
  useEffect(() => {
    if (selectedLocation && cameraRef.current) {
      console.log("Moving camera for selectedLocation:", selectedLocation)
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

  // Watch for selectedMarker changes and move camera (only when selecting, not deselecting)
  useEffect(() => {
    if (selectedMarker && cameraRef.current) {
      console.log("Moving camera for selectedMarker:", selectedMarker.name)
      // Set flag to prevent map onPress from clearing the selection
      setIsSettingFromSearch(true)

      // Move camera to selected marker location
      setCameraCenter([selectedMarker.coordinates[0], selectedMarker.coordinates[1]])
      setZoom(zoom < 13 ? 13 : zoom) // Zoom in a bit more for markers
      // Clear the flag after a short delay
      setTimeout(() => {
        setIsSettingFromSearch(false)
      }, 500)
    }
    // Note: We only trigger this effect when selectedMarker becomes truthy (not when it becomes null)
  }, [selectedMarker?.id]) // Only watch the ID, so it doesn't trigger when setting to null

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
  const handleGroupPress = (marker: MapGroup) => {
    setSelectedMarker(marker)
    if (onGroupPress) {
      onGroupPress(marker)
    }
  }

  // Esto tambien podria ir a un utils
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

  return (
    <View style={[styles.container, style]}>
      <MapLibreGL.MapView
        style={styles.map}
        onLongPress={handleMapLongPress}
        onRegionDidChange={enableDynamicFetch ? handleRegionDidChange : undefined}
        // TODO: ver de mover el url a otro lado, y poder integrar con dark mode (radar-dark-v1)
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
          {...(!enableDynamicFetch && {
            centerCoordinate: [cameraCenter[0], cameraCenter[1]],
            zoomLevel: zoom,
          })}
          animationDuration={1000}
        />

        {/* BUSQUEDA: Muestra el radio de busqueda seleccionado */}
        {selectedLocation && (
          <>
            {/* Search radius circle */}
            <MapLibreGL.ShapeSource
              id="search-radius-source"
              shape={createCircleGeoJSON(
                [selectedLocation.longitude, selectedLocation.latitude],
                searchRadiusKm,
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

        {/* GRUPOS: Muestra los grupos cercanos con transición suave */}
        {groups?.map((group) => (
          <MapLibreGL.PointAnnotation
            key={`group-${group.id}`}
            id={`group-${group.id}`}
            coordinate={group.coordinates}
            onSelected={() => handleGroupPress(group)}
          >
              <GroupMapIcon group={group} />
            <MapLibreGL.Callout title={group.name} />
          </MapLibreGL.PointAnnotation>
        ))}
      </MapLibreGL.MapView>

      {/* BUSQUEDA: Para cuando selecciono ubicacion en la search */}
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

      {/* GRUPOS: Para cuando selecciono un grupo */}
      {/* Para el grupo, poner boton de entrar al grupo y eso */}
      {selectedMarker && (
        // <LocationInfo height={150}>
          <GroupMapInfoCard group={selectedMarker} />
        // </LocationInfo>
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
