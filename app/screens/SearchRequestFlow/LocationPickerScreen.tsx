"use client"
import { useState } from "react"
import { View, Alert, ViewStyle, Keyboard } from "react-native"
import { Screen, Text, Button } from "../../components"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native" 
import { NativeStackScreenProps } from "@react-navigation/native-stack" 
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import { buttons, buttonTexts, texts } from "@/theme/commonStyles"

import { MainStackParamList } from "@/navigators/MainNavigator"
import { MapViewComponent } from "@/components/Location/MapView"
import CustomAutocomplete from "@/components/Location/SearchBar"
import { selectedLocation } from "types"

type LocationPickerScreenProps = NativeStackScreenProps<MainStackParamList, "LocationPickerScreen">

export const LocationPickerScreen = observer(function LocationPickerScreen({
  route,
}: LocationPickerScreenProps) {
  // Destructure nextScreen AND the optional callback from route.params
  const { nextScreen, onLocationSelect } = route.params || {}
    
  const navigation = useNavigation<NativeStackScreenProps<MainStackParamList>["navigation"]>()
  const { themed } = useAppTheme()
  const { requestStore } = useStores()
  const [selectedLocation, setSelectedLocation] = useState<selectedLocation | null>(
    requestStore.location ?? null,
  )
  const [searchRadiusKm, setSearchRadiusKm] = useState(requestStore.radiusKm || 1) 

  // Combined Handler for the single "Siguiente" button
  const handlePrimaryAction = () => {
    if (!selectedLocation) {
        Alert.alert("Selección Requerida", "Por favor, selecciona una ubicación en el mapa o búscalas.")
        return
    }

    // 1. Save data to the store regardless of the final navigation action
    requestStore.setLocation(selectedLocation)
    console.log("Selected Location saved to store:", selectedLocation)
    requestStore.setRadiusKm(searchRadiusKm)

    // 2. CHECK THE MODE: If the callback is present, this screen was opened for selection.
    if (onLocationSelect) {
      
      // Execute the callback function passed from the previous screen
      onLocationSelect(selectedLocation)
      
      // Go back to the screen that called this one
      navigation.goBack()

    } else {
      if (nextScreen) {
        navigation.navigate(nextScreen as any)
      } else {
        navigation.navigate("SchedulePickerScreen" as any)
      }
    }
  }

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={themed($screenContent)}
      backgroundColor={themed($screenBackground)}
      KeyboardAvoidingViewProps={{
        behavior: "padding",
        keyboardVerticalOffset: 0,
      }}
    >
      {/* Search Bar with Clear Button */}
      <View style={themed($searchContainer)}>
        <View style={themed($searchInputContainer)}>
          {/* Search Input */}
          <CustomAutocomplete
            placeholder="Buscar ubicación en Argentina..."
            onSelection={(location: any) => {
              console.log("Selected location:", location)
              Keyboard.dismiss()

              // Small delay to ensure proper state management
              setTimeout(() => {
                setSelectedLocation({
                  id: location.id,
                  name: location.name,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  address: location.address,
                })
              }, 100)
            }}
          />
        </View>
      </View>

      {/* Map Container - takes up available space */}
      <View style={themed($mapContainer)}>
        <MapViewComponent
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          allowSelectLocation={true}
          searchRadiusKm={searchRadiusKm} 
          setSearchRadiusKm={setSearchRadiusKm}
        />
      </View>

      {/* Fixed Button Container - always at bottom */}
      <View style={themed($buttonContainer)}>
        <Text style={[themed(texts.bodySmall), { textAlign: "center", marginBottom: 6 }]}>
          Manten presionado en el mapa para seleccionar una ubicación
        </Text>
        <Button
          // Change text dynamically based on the action
          text={onLocationSelect ? "Seleccionar" : "Siguiente"} 
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
          onPress={handlePrimaryAction} // Use the new combined handler
        />
      </View>
    </Screen>
  )
})

// Styled components using theming
const $screenBackground = "background"

const $screenContent = (theme: any): ViewStyle => ({
  flex: 1,
  padding: 1,
})

const $searchContainer = (theme: any): ViewStyle => ({
  position: "relative",
  zIndex: 100,
  marginTop: theme.spacing.sm,
  marginBottom: theme.spacing.sm,
})

const $searchInputContainer = (theme: any): ViewStyle => ({
  position: "relative",
  flexDirection: "row",
  alignItems: "center",
})

const $mapContainer = (theme: any): ViewStyle => ({
  flex: 1,
  minHeight: 300, 
})

const $buttonContainer = (theme: any): ViewStyle => ({
  paddingHorizontal: theme.spacing.md,
  paddingTop: theme.spacing.sm,
  paddingBottom: theme.spacing.lg,
  backgroundColor: theme.colors.background,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
})

const $nextButton = (theme: any): ViewStyle => ({
  marginTop: 0,
  marginBottom: 0,
})
