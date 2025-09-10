import { Button, Screen, Text } from "@/components"
import { ActivitiesForm } from "@/components/Custom/ActivitiesForm"
import { MainStackParamList } from "@/navigators/MainNavigator"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useAppTheme } from "@/utils/useAppTheme"
import { useThemedStyles } from "@/theme"
import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { useState, useEffect, useCallback } from "react"
import { Alert, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import { Slider, View } from "tamagui"

type ActivityPickerScreenProps = NativeStackScreenProps<MainStackParamList, "ActivityPickerScreen">

export const ActivityPickerScreen = observer(function ActivityPickerScreen({
  route,
}: ActivityPickerScreenProps) {
  const { nextScreen } = route.params || {}
  const { themed } = useAppTheme()
  const { requestStore } = useStores()

  // Safety check to ensure store is available
  if (!requestStore) {
    console.error("RequestStore not available in ActivityPickerScreen")
    return (
      <Screen preset="fixed">
        <Text>Loading...</Text>
      </Screen>
    )
  }

  // Changed to work with multiple activities array
  const [selectedActivities, setSelectedActivities] = useState<any[]>([])

  // Add slider states with proper initialization
  const [maxParticipants, setMaxParticipants] = useState<number>(requestStore.maxParticipants || 5)
  const [minParticipants, setMinParticipants] = useState<number>(
  requestStore.minParticipants && requestStore.minParticipants >= 3
    ? requestStore.minParticipants
    : 3
)

  const navigation = useNavigation<NativeStackScreenProps<MainStackParamList>["navigation"]>()

  // Create a stable callback for setSelectedPreferences
  const handleSetSelectedPreferences = useCallback(
    (activitiesOrUpdater: any[] | ((prev: any[]) => any[])) => {
      console.log("ActivityPickerScreen setSelectedPreferences called")

      // Handle function updater case
      if (typeof activitiesOrUpdater === "function") {
        const activities = activitiesOrUpdater(selectedActivities)
        console.log("Function updater, result length:", activities.length)

        // Simple single selection logic
        if (Array.isArray(activities)) {
          if (activities.length <= 1) {
            setSelectedActivities(activities)
          } else {
            const lastItem = activities[activities.length - 1]
            console.log("Multiple items, keeping last item")
            setSelectedActivities([lastItem])
          }
        }
      } else {
        // Handle direct array case
        const activities = activitiesOrUpdater
        console.log("Direct array, length:", activities.length)

        if (Array.isArray(activities)) {
          if (activities.length <= 1) {
            setSelectedActivities(activities)
          } else {
            const lastItem = activities[activities.length - 1]
            console.log("Multiple items, keeping last item")
            setSelectedActivities([lastItem])
          }
        }
      }
    },
    [selectedActivities],
  )

  const handleNext = () => {
    try {
      // Save activities to the store
      if (selectedActivities.length > 0) {
        requestStore.setActivity(selectedActivities[0])

        // Save participants data to the store
        requestStore.setMinParticipants(minParticipants)
        requestStore.setMaxParticipants(maxParticipants)
        console.log("selecting activities:", selectedActivities[0])
        // Navigate to the next screen using proper navigation structure
        navigation.navigate("LocationPickerScreen" as any)
      } else {
        Alert.alert("Error", "Por favor selecciona una actividad")
      }
    } catch (error) {
      console.error("Error navigating:", error)
      Alert.alert("Error", "Hubo un problema al continuar")
    }
  }

  // Handle slider value changes
  const handleMaxParticipantsChange = (value: number[]) => {
    const newMax = value[0]
    setMaxParticipants(newMax)
    // Ensure min doesn't exceed max
    if (minParticipants > newMax) {
      setMinParticipants(newMax - 1 > 1 ? newMax - 1 : 1)
    }
  }

  const handleMinParticipantsChange = (value: number[]) => {
    const newMin = value[0]
    setMinParticipants(newMin)
    // Ensure max is at least min + 1
    if (maxParticipants <= newMin) {
      setMaxParticipants(newMin + 1 <= 10 ? newMin + 1 : 10)
    }
  }

  return (
    <Screen
      preset="fixed" // Changed back to fixed to avoid VirtualizedList nesting
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      {/* Activities Form - Modified to enforce single selection */}
      <ActivitiesForm
        selectedPreferences={selectedActivities}
        setSelectedPreferences={handleSetSelectedPreferences}
        title="¿Qué actividad estas buscando hacer?"
        description="Selecciona una actividad que te interese. Puedes elegir solo una opción."
      />

      {/* Participants Selection */}
      <View style={styles.participantsContainer}>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Mínimo integrantes: {minParticipants}</Text>
          <Slider
  size="$1.5"
  width="95%"
  value={[minParticipants]}
  onValueChange={handleMinParticipantsChange}
  max={10}
  min={3}
  step={1}
  animation="quick"
>
  <Slider.Track>
    <Slider.TrackActive animation="quick" />
  </Slider.Track>
  <Slider.Thumb circular index={0} animation="bouncy" />
</Slider>

        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Máximo integrantes: {maxParticipants}</Text>
          <Slider
  size="$1.5"
  width="95%"
  value={[maxParticipants]}
  onValueChange={handleMaxParticipantsChange}
  max={10}
  min={3}
  step={1}
  animation="quick"
>
  <Slider.Track>
    <Slider.TrackActive animation="quick" />
  </Slider.Track>
  <Slider.Thumb circular index={0} animation="bouncy" />
</Slider>

        </View>
      </View>

      {/* Next Button */}
      <Button
        text="Siguiente"
        style={[
          $nextButton,
          selectedActivities.length > 0 ? $nextButtonEnabled : $nextButtonDisabled,
        ]}
        textStyle={[
          $nextButtonText,
          selectedActivities.length > 0 ? $nextButtonTextEnabled : $nextButtonTextDisabled,
        ]}
        disabled={selectedActivities.length === 0}
        onPress={handleNext}
      />
    </Screen>
  )
})

const styles = StyleSheet.create({
  participantsContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginVertical: 20,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E5E5EA",
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    height: 50,
    paddingHorizontal: 16,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
})

const $container = {
  flex: 1,
  padding: 20,
}

const $bottomContainerInsets = {}

const $screenBackground = "background"

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

