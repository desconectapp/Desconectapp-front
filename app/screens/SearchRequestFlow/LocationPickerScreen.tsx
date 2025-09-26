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
  Keyboard,
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
  const navigation = useNavigation<NativeStackScreenProps<MainStackParamList>["navigation"]>()
  const { themed } = useAppTheme()
  const { requestStore } = useStores()
  // const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<selectedLocation | null>(requestStore.location??null)
  const [searchRadiusKm, setSearchRadiusKm] = useState(requestStore.radiusKm || 5) // Use store value or default 5km

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

  const handleNext = () => {
    // Save selected location and radius to the store
    if (selectedLocation) {
      requestStore.setLocation(selectedLocation)
      requestStore.setRadiusKm(searchRadiusKm)
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

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={[{ flex: 1, padding: 1 }]}
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
           onSelection={(address: any) => {
             console.log('Selected address:', address);
             Keyboard.dismiss();
             setSelectedLocation({
               id: address.place_id ? String(address.place_id) : "unknown",
               name: address.name || address.formattedAddress.split(",")[0],
               latitude: address.latitude,
               longitude: address.longitude,
               address: address.formattedAddress,
             })             
            }
           }
         />
        </View>
      </View>

      <MapViewComponent
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        allowSelectLocation={true}
        searchRadiusKm={searchRadiusKm} // Pass km directly
        setSearchRadiusKm={setSearchRadiusKm}

        groups={markers}
       
        
        onGroupPress={(marker) => Alert.alert("Marker Pressed", `You pressed ${marker.title}`)}

      />
      {/* <ScrollView
        style={themed($scrollView)}
        contentContainerStyle={themed($scrollContent)}
        keyboardShouldPersistTaps="handled"
      > */}
        {/* Radius Slider */}
        {/* {selectedLocation && (
          <CustomSlider
            value={searchRadiusKm}
            min={1}
            max={15}
            step={1}
            label="Radio de búsqueda"
            formatValue={(value) => `${value} km`}
            onValueChange={setSearchRadiusKm}
            showButtons={true}
          />
        )}     */}
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
      {/* </ScrollView> */}

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
  marginBottom: theme.spacing.sm,
})
