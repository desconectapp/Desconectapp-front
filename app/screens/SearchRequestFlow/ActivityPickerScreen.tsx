import { Button, Screen, Text } from "@/components"
import { ActivitiesForm } from "@/components/Custom/ActivitiesForm"
import { AppStackScreenProps } from "@/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import { Alert } from "react-native"

interface ActivityPickerScreenProps {
  nextScreen: any; 
}

export function ActivityPickerScreen({ nextScreen }: ActivityPickerScreenProps) {
  const { themed } = useAppTheme()
  const [selectedActivities, setSelectedActivities] = useState<string[]>(["futbol"])
  const navigation = useNavigation<AppStackScreenProps<"Main">["navigation"]>()

  const handleNext = () => {
    // Guardar las activiades en el storage

    //Ir a la siguiente pantalla
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
