import { Button, Screen, Text } from "@/components"
import { MainStackParamList } from "@/navigators/MainNavigator";
import { useAppTheme } from "@/utils/useAppTheme"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"

import { Alert } from "react-native"

interface RequestConfirmationScreenProps {
  nextScreen: any; 
}

export function RequestConfirmationScreen({ nextScreen }: RequestConfirmationScreenProps) {
  const { themed } = useAppTheme()
 const [selectedSchedules, setSelectedSchedules] = useState<string[]>([])

  const navigation = useNavigation<MainStackParamList["navigation"]>()

  const activities = ["futbol", "basket", "tenis"] // This should be fetched from storage or state
  const location = "Parque Centenario" // This should be fetched from storage or state
  const schedule = "Lunes 10:00 - 12:00" // This should be fetched from storage or state

   const handleSearch = () => {
      // Agarrar la data del storage

      // Hacer la request
   
      // redireccionar a home?
      navigation.navigate("HomeScreen")
    }
  
    return (
      <Screen
        preset="scroll"
        contentContainerStyle={[$container, $bottomContainerInsets]}
        backgroundColor={themed($screenBackground)}
      >
        <Text>Buscar</Text>
        <Text>{activities.join(", ")}</Text>
        <Text>{location}</Text>
        <Text>{schedule}</Text>

        {/* Next Button */}    
        <Button
          text="Buscar"
          style={[
            $nextButton,
            selectedSchedules.length > 0 ? $nextButtonEnabled : $nextButtonDisabled,
          ]}
          textStyle={[
            $nextButtonText,
            selectedSchedules.length > 0 ? $nextButtonTextEnabled : $nextButtonTextDisabled,
          ]}
          disabled={selectedSchedules.length === 0}
          onPress={handleSearch}
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
  