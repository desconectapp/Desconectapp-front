import { useStores } from "@/models"
import { useRef, useState } from "react"
import { Text, View } from "react-native"
import { PanGestureHandler, TapGestureHandler } from "react-native-gesture-handler"
import Radar, { Map } from 'react-native-radar';
import RadarMapMarker from 'react-native-radar';

import MapLibreGL from '@maplibre/maplibre-react-native';
import { Camera, Images, ShapeSource, SymbolLayer } from '@maplibre/maplibre-react-native';


MapLibreGL.setAccessToken(null); // Deshabilitar el token de MapLibre

Radar.initialize('prj_test_pk_c887ecbd9e95e748a7b945985b709ec5e5bc56ff'); // Reemplazá con tu clave de Radar


export const MapViewComponent = () => {
const [cameraConfig, setCameraConfig] = useState({
  triggerKey: Date.now(),
  centerCoordinate: [-73.9911, 40.7342],
  animationMode: 'flyTo' as const, // Add 'as const' to fix type
  animationDuration: 600,
  zoomLevel: 12,
});

  const onRegionDidChange = () => {
    // do something on region change
  }

  const onSelect = () => {
    // do something with selected address
  }

  const pointsCollection = {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {
          _id: '123',
        },
        geometry: {
          type: "Point" as const,
          coordinates: [-73.9911, 40.7342]
        }
      }
    ]
  };
  
  const pointsCollection2 = {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {
          _id: '456',
          emoji: '🍕',
          titulo: 'Pizza party'
        },
        geometry: {
          type: "Point" as const,
          coordinates: [-73.9811, 40.7442]
        }
      }
    ]
  };

  const onPress = (p: typeof pointsCollection2.features[number]) => {
    console.log("Pressed:", p.properties.titulo);
  }
    
  return (
   <View style={{ width: '100%', marginTop: '10%', height: '90%' }}>
    <Map mapOptions={{ onRegionDidChange }}>
    <MapLibreGL.Camera {...cameraConfig} />

    {pointsCollection2.features.map(p => (
      <MapLibreGL.PointAnnotation
        key={p.properties._id}
        id={p.properties._id}
        coordinate={p.geometry.coordinates} // [lng, lat]
        onSelected={() => onPress(p)}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 30 }}>{p.properties.emoji}</Text>
          <Text
            style={{
              color: 'black',
              backgroundColor: 'white',
              paddingHorizontal: 4,
              borderRadius: 4,
            }}
          >
            {p.properties.emoji}{p.properties.titulo}
          </Text>
        </View>
      </MapLibreGL.PointAnnotation>
    ))}
  </Map>
</View>);
}
