import { Button, Screen, Text } from "@/components"
import { AppStackScreenProps } from "@/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"

import { TimePickerForm } from "@/components/Custom/TimePickerForm"

interface SchedulePickerScreenProps {
  nextScreen: any; 
}

export const SchedulePickerScreen = observer(function SchedulePickerScreen({ nextScreen }: SchedulePickerScreenProps) {
  const { themed } = useAppTheme()
  const { requestStore } = useStores()

  const navigation = useNavigation<AppStackScreenProps<"Main">["navigation"]>()

   const handleNext = () => {
      // The TimePickerForm already manages the store directly, so we just navigate
      navigation.navigate("RequestConfirmationScreen" as any)
    }
  
    return (
      <Screen
        preset="fixed"
        contentContainerStyle={[$container, $bottomContainerInsets]}
        backgroundColor={themed($screenBackground)}
      >
        <Text>Selecciona dias y horarios</Text>

        <TimePickerForm/>
        {/* Next Button */}    
        <Button
          text="Siguiente"
          style={[
            $nextButton,
            requestStore.isScheduleSelected ? $nextButtonEnabled : $nextButtonDisabled,
          ]}
          textStyle={[
            $nextButtonText,
            requestStore.isScheduleSelected ? $nextButtonTextEnabled : $nextButtonTextDisabled,
          ]}
          disabled={!requestStore.isScheduleSelected}
          onPress={handleNext}
        />
    </Screen>
  )
})

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
  