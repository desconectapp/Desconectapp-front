import { useStores } from "@/models"
import { useRef, useState } from "react"
import { Text, View, StyleSheet, Platform } from "react-native"
import MapLibreGL from '@maplibre/maplibre-react-native'
import { useEffect } from "react"
import Radar, { Map, Autocomplete } from 'react-native-radar';
import { FlatList, LongPressGestureHandler , State, TextInput, TouchableOpacity} from "react-native-gesture-handler"
import CustomAutocomplete from "./SearchBar"
import { selectedLocation } from "types"


// Initialize MapLibre
// MapLibreGL.setAccessToken(null) // No token needed for OpenStreetMap
const apiKey = process.env.EXPO_PUBLIC_RADAR_API_KEY || ''
if (!apiKey) {
  console.warn("RADAR_API_KEY is not set. Please set it in your .env file.")
} else {
  console.log("RADAR_API_KEY is set.")
}
Radar.initialize(apiKey)
MapLibreGL.setAccessToken(apiKey) // No token needed for OpenStreetMap
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
  location: selectedLocation,
  setLocation: (location: selectedLocation) => void,
  zoom: number,
  setZoom: (zoom: number) => void,
  initialZoom?: number
  markerRadius?: number // in degrees, approx 0.01 ~ 1km
  markers?: MapMarker[] // markers to display
  onMarkerPress?: (marker: MapMarker) => void // callback when marker is pressed
  onLongPress?: (coordinates: [number, number]) => void // callback when map is long pressed
  allowAddMarkers?: boolean // whether to allow adding markers via long press
  style?: any
}
export const MapViewComponent = ({
  location,
  setLocation,
  zoom,
  setZoom,
  markerRadius = 0.01,
  initialZoom = 13,
  markers = [],
  onMarkerPress,
  onLongPress,
  allowAddMarkers = false,
  style,
}: MapViewProps) => {
  const [userMarkers, setUserMarkers] = useState<MapMarker[]>([])
  const cameraRef = useRef<any>(null)

  // Combine passed markers with user-added markers
  const allMarkers = [...markers, ...userMarkers]
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)

  useEffect(() => {
    if (allowAddMarkers && userMarkers.length > 0 && cameraRef.current) {
      const lastMarker = userMarkers[userMarkers.length - 1]
      cameraRef.current.setCamera({
        centerCoordinate: lastMarker.coordinates,
        zoomLevel: initialZoom,
        animationDuration: 100,
      })
    }
  }, [userMarkers, allowAddMarkers, initialZoom])

  // LongPress selecciona una ubicacion
  const handleMapLongPress = (event: any) => {
    if (!allowAddMarkers && !onLongPress) return
    const coordinates = event.geometry.coordinates as [number, number]
    onLongPress?.(coordinates)   
  }

  const handleMarkerPress = (marker: MapMarker) => {
    setSelectedMarker(marker)
    if (onMarkerPress) {
      onMarkerPress(marker)
    } else if (allowAddMarkers && userMarkers.some(m => m.id === marker.id)) {
      setUserMarkers(prev => prev.filter(m => m.id !== marker.id))
    }
  }

  const getMarkerStyle = (marker: MapMarker) => ({
    backgroundColor: marker.color || '#FF0000',
    borderRadius: 15,
    width: marker.radius ? marker.radius * 2000 : 30,
    height: marker.radius ? marker.radius * 2000 : 30,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: 'white',
  })


  return (
    <View style={[styles.container, style]}>
      <MapLibreGL.MapView
      style={styles.map}
      mapStyle={`https://api.radar.io/maps/styles/radar-default-v1?publishableKey=${apiKey}`}
      onLongPress={handleMapLongPress}
      onPress={() => setSelectedMarker(null)} // Deselect marker when clicking on map
      >
      <MapLibreGL.Camera
        ref={cameraRef}
        centerCoordinate={[location.longitude, location.latitude]}
        zoomLevel={zoom}
      />

      {allMarkers.map((marker) => (
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
      ))}
      </MapLibreGL.MapView>
     { /* Bottom overlay for selected marker info */}
      {selectedMarker && (
        <View style={styles.bottomOverlayContainer}>
        <View style={[styles.gradientOverlay]}/>
        <View style={styles.selectedMarkerInfo}>
          {/* Container for close button and info */}
          <View style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
            <TouchableOpacity
              style={{
          margin: 8,
          backgroundColor: 'rgba(155, 155, 155, 0.32)',
          width: 26,
          height: 26,
          borderRadius: 13,
          alignItems: 'center',
          right:-80,
          top: 35,
          
              }}
              onPress={() => setSelectedMarker(null)}
            >
              <Text style={{ color: 'white', fontSize: 18,  }}>x</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 32, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {selectedMarker.title || 'Marker'}
            </Text>
            {selectedMarker.emoji && (
              <Text style={{ fontSize: 24 }}>{selectedMarker.emoji}</Text>
            )}
            <Text style={{ color: 'white', fontSize: 12 }}>
              Lat: {selectedMarker.coordinates[1].toFixed(5)}, Lon: {selectedMarker.coordinates[0].toFixed(5)}
            </Text>
            {selectedMarker.data && (
              <Text style={{ color: 'white', fontSize: 12 }}>
          {JSON.stringify(selectedMarker.data)}
              </Text>
            )}
          </View>
        </View>
        </View>
      )}

    </View>
  )
}

// Add styles for overlay and gradient
const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  map: { 
    flex: 1 
  },
  markerEmoji: {
    fontSize: 16,
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bottomOverlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 5,
    right: 5,
    bottom: 2.5,
    height: 100,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  selectedMarkerInfo: {
    padding: 16,
    alignItems: 'center',
    zIndex: 2,
  },
})
