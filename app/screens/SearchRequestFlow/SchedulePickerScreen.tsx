import { Button, Screen, Text } from "@/components"
import { MainStackParamList } from "@/navigators/MainNavigator";
import { useAppTheme } from "@/utils/useAppTheme"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"

import { Alert } from "react-native"

interface SchedulePickerScreenProps {
  nextScreen: any; 
}

export function SchedulePickerScreen({ nextScreen }: SchedulePickerScreenProps) {
  const { themed } = useAppTheme()
 const [selectedSchedules, setSelectedSchedules] = useState<string[]>(["1"])

  const navigation = useNavigation<MainStackParamList["navigation"]>()

   const handleNext = () => {
      // Guardar las activiades en el storage
  
      //Ir a la siguiente pantalla
      navigation.navigate(nextScreen ?? "RequestConfirmationScreen")
    }
  
    return (
      <Screen
        preset="scroll"
        contentContainerStyle={[$container, $bottomContainerInsets]}
        backgroundColor={themed($screenBackground)}
      >
        <Text>Selecciona dias y horarios</Text>


        {/* Next Button */}    
        <Button
          text="Siguiente"
          style={[
            $nextButton,
            selectedSchedules.length > 0 ? $nextButtonEnabled : $nextButtonDisabled,
          ]}
          textStyle={[
            $nextButtonText,
            selectedSchedules.length > 0 ? $nextButtonTextEnabled : $nextButtonTextDisabled,
          ]}
          disabled={selectedSchedules.length === 0}
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
  