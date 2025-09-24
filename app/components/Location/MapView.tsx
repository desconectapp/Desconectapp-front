import { useStores } from "@/models"
import { useRef, useState } from "react"
import { Text, View, StyleSheet, Platform } from "react-native"
import MapLibreGL from '@maplibre/maplibre-react-native'
import { useEffect } from "react"
import Radar, { Map } from 'react-native-radar';
import { LongPressGestureHandler , State} from "react-native-gesture-handler"


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
}

export interface MapViewProps {
  // initialCenter?: [] // [longitude, latitude]
  cameraCenter?: [] // if provided, camera will center here
  initialZoom?: number
  markers?: MapMarker[] // markers to display
  onMarkerPress?: (marker: MapMarker) => void // callback when marker is pressed
  onLongPress?: (coordinates: [number, number]) => void // callback when map is long pressed
  allowAddMarkers?: boolean // whether to allow adding markers via long press
  style?: any
}
export const MapViewComponent = ({
  cameraCenter,
  initialZoom = 16,
  markers = [],
  onMarkerPress,
  onLongPress,
  allowAddMarkers = false,
  style,
}: MapViewProps) => {
  const [userMarkers, setUserMarkers] = useState<MapMarker[]>([])
  const cameraRef = useRef<any>(null)
  const center = cameraCenter;

  // Combine passed markers with user-added markers
  const allMarkers = [...markers, ...userMarkers]

  // // Pan camera to last marker if allowAddMarkers is true and userMarkers changes
  useEffect(() => {
    if (allowAddMarkers && userMarkers.length > 0 && cameraRef.current) {
      console.log("Panning to last user-added marker:", userMarkers[userMarkers.length - 1])
      const lastMarker = userMarkers[userMarkers.length - 1]
      cameraRef.current.setCamera({
        centerCoordinate: lastMarker.coordinates,
        zoomLevel: initialZoom,
        animationDuration: 100,
      })
    }
  }, [userMarkers, allowAddMarkers, initialZoom])

  const handleMapLongPress = (event: any) => {
    if (!allowAddMarkers && !onLongPress) return

    const coordinates = event.geometry.coordinates as [number, number]

    if (onLongPress) {
      // Let parent handle the long press
      onLongPress(coordinates)

      // cameraRef.current.setCamera({
      //   centerCoordinate: coordinates,
      //   zoomLevel: initialZoom,
      //   animationDuration: 100,
      // })
    } else if (allowAddMarkers) {
      // Add marker automatically
      const newMarker: MapMarker = {
        id: Date.now().toString(),
        coordinates,
        title: 'New Marker',
        emoji: '📍',
        color: '#FF0000',
      }
      setUserMarkers(prev => [...prev, newMarker])
    }
  }

  const handleMarkerPress = (marker: MapMarker) => {
    if (onMarkerPress) {
      onMarkerPress(marker)
    } else if (allowAddMarkers && userMarkers.some(m => m.id === marker.id)) {
      // Remove user-added marker if no custom handler
      setUserMarkers(prev => prev.filter(m => m.id !== marker.id))
    }
  }

  const getMarkerStyle = (marker: MapMarker) => ({
    backgroundColor: marker.color || '#FF0000',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: 'white',
  })

  return (
      <LongPressGestureHandler
  minDurationMs={700}
  onHandlerStateChange={(event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      // calcular coordenadas de screen -> map si es necesario
      console.log('Long press', event.nativeEvent);
      // acá disparás tu lógica onLongPress
    }
  }}
>
    <View style={[styles.container, style]}>
      {/* <Map
        style={styles.map}
        styleURL="https://demotiles.maplibre.org/style.json"
        onPress={handleMapLongPress} // Radar's Map uses onPress, not onLongPress
      > */}
       <MapLibreGL.MapView
        style={styles.map}
        mapStyle={`https://api.radar.io/maps/styles/radar-default-v1?publishableKey=${apiKey}`}
        onLongPress={handleMapLongPress}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          centerCoordinate={center}
          zoomLevel={initialZoom}
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
            {marker.title && (
              <MapLibreGL.Callout title={marker.title} />
            )}
          </MapLibreGL.PointAnnotation>
        ))}
      {/* </Map> */}
        </MapLibreGL.MapView> 

    </View>
    </LongPressGestureHandler>
  )
}

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
})