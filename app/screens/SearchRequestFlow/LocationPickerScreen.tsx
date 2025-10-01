"use client"
import { useState } from "react"
import { View, Alert, ViewStyle, Keyboard } from "react-native"
import { Screen, Text, Button } from "../../components"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import { buttons, buttonTexts, texts } from "@/theme/commonStyles"

import { MainStackParamList } from "@/navigators/MainNavigator"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { MapViewComponent } from "@/components/Location/MapView"
import CustomAutocomplete from "@/components/Location/SearchBar"
import { selectedLocation } from "types"

type LocationPickerScreenProps = NativeStackScreenProps<MainStackParamList, "LocationPickerScreen">

export const LocationPickerScreen = observer(function LocationPickerScreen({
  route,
}: LocationPickerScreenProps) {
  const { nextScreen } = route.params || {}
  const navigation = useNavigation<NativeStackScreenProps<MainStackParamList>["navigation"]>()
  const { themed } = useAppTheme()
  const { requestStore } = useStores()
  const [selectedLocation, setSelectedLocation] = useState<selectedLocation | null>(
    requestStore.location ?? null,
  )
  const [searchRadiusKm, setSearchRadiusKm] = useState(requestStore.radiusKm || 1) // Use store value or default 5km

  const handleNext = () => {
    // Save selected location and radius to the store
    if (selectedLocation) {
      requestStore.setLocation(selectedLocation)
      requestStore.setRadiusKm(searchRadiusKm)
    }

    navigation.navigate("SchedulePickerScreen" as any)
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
            onSelection={(address: any) => {
              console.log("Selected address:", address)
              Keyboard.dismiss()

              // Small delay to ensure proper state management
              setTimeout(() => {
                setSelectedLocation({
                  id: address.place_id ? String(address.place_id) : "unknown",
                  name: address.name || address.formattedAddress.split(",")[0],
                  latitude: address.latitude,
                  longitude: address.longitude,
                  address: address.formattedAddress,
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
          searchRadiusKm={searchRadiusKm} // Pass km directly
          setSearchRadiusKm={setSearchRadiusKm}
        />
      </View>

      {/* Fixed Button Container - always at bottom */}
      <View style={themed($buttonContainer)}>
        <Text style={[themed(texts.bodySmall), { textAlign: "center", marginBottom: 6 }]}>
          Manten presionado en el mapa para seleccionar una ubicación
        </Text>
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
  minHeight: 300, // Ensure minimum height for map
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
