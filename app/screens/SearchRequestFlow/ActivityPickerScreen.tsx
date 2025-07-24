import { Button, Screen, Text } from "@/components"
import { ActivitiesForm } from "@/components/Custom/ActivitiesForm"
import { AppStackScreenProps } from "@/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { useState, useEffect } from "react"
import { Alert } from "react-native"

interface ActivityPickerScreenProps {
  nextScreen: any; 
}

export function ActivityPickerScreen({ nextScreen }: ActivityPickerScreenProps) {
  const { themed } = useAppTheme()
  const { requestStore } = useStores()
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    requestStore.activities.length > 0 ? requestStore.activities.slice() : ["futbol"]
  )
  const navigation = useNavigation<AppStackScreenProps<"Main">["navigation"]>()

  // Update store when selectedActivities changes
  // Nota: Podria hacer que ActivitiesForm haga esto directamente y nos ahorramos
  // el selectedActivities y setSelectedActivities
  useEffect(() => {
    requestStore.setActivities(selectedActivities)
  }, [selectedActivities, requestStore])

  const handleNext = () => {
    // Save activities to the store
    requestStore.setActivities(selectedActivities)

    // Navigate to the next screen
    navigation.navigate(nextScreen ?? "LocationPickerScreen")
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      <Text>Selecciona una actividad</Text>
      {/* Next Button */}
      <ActivitiesForm
        selectedPreferences={selectedActivities}
        setSelectedPreferences={setSelectedActivities}
      />

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
}

const $container = { padding: 20 }
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
