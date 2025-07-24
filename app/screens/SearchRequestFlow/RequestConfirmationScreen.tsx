import { Button, Screen, Text } from "@/components"
import { AppStackScreenProps } from "@/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { View } from "react-native"

import { useStores } from "@/models"

interface RequestConfirmationScreenProps {
  nextScreen: any; 
}

export function RequestConfirmationScreen({ nextScreen }: RequestConfirmationScreenProps) {
  const { themed } = useAppTheme()

  const navigation = useNavigation<AppStackScreenProps<"Main">["navigation"]>()
  const { requestStore } = useStores()

  const activities = requestStore.activities
  const location = requestStore.location
  const schedules = requestStore.schedules

  // Helper function to format schedule display
  const formatSchedules = () => {
    if (schedules.length === 0) {
      return "No hay horarios seleccionados"
    }
    
    return schedules.map(daySchedule => {
      const timeSlotTexts = daySchedule.timeSlots.map(slot => `${slot.start} - ${slot.end}`)
      return `${daySchedule.day}: ${timeSlotTexts.join(", ")}`
    }).join("\n")
  }
  const formatLocation = () => {
    if (!location) {
      return "No hay ubicación seleccionada"
    }
    // split location y , and return onlty 2nd and 3rd part
    const parts = location.address.split(", ")
    return parts.length > 2 ? `${parts[1]}, ${parts[2]}` : location.address
  }

   const handleSearch = () => {
      // Agarrar la data del storage
      const requestData = requestStore.getRequestData()
      console.log("Datos de la búsqueda:", requestData)

      // TODO: Hacer la request al backend
   
      // redireccionar a home? 
      // For now, just go back or navigate to a tab
      navigation.goBack()
    }
  
    return (
      <Screen
        preset="scroll"
        contentContainerStyle={[$container, $bottomContainerInsets]}
        backgroundColor={themed($screenBackground)}
      >
        <Text preset="heading">Resumen de búsqueda</Text>
        
        {requestStore.isRequestComplete ? (
          <View style={$statusContainer}>
            <Text style={$completeText}>✅ Todos los datos están completos</Text>
          </View>
        ) : (
          <View style={$statusContainer}>
            <Text style={$incompleteText}>⚠️ Faltan datos por completar</Text>
          </View>
        )}
        
        <View style={$sectionContainer}>
          <Text preset="subheading">Queres hacer:</Text>
          <Text>{activities.length > 0 ? activities.join(", ") : "No hay actividades seleccionadas"}</Text>
        </View>

        <View style={$sectionContainer}>
          <Text preset="subheading">Cerca de:</Text>
          <Text>{formatLocation() || "No hay ubicación seleccionada"}</Text>
        </View>

        <View style={$sectionContainer}>
          <Text preset="subheading">Los dias:</Text>
          <Text style={$scheduleText}>{formatSchedules()}</Text>
        </View>

        {/* Next Button */}    
        <Button
          text="Buscar"
          style={[
            $nextButton,
            $nextButtonEnabled 
          ]}
          textStyle={[
            $nextButtonText,
            $nextButtonTextEnabled
          ]}
          
          onPress={handleSearch}
        />
      </Screen>
    )
  }
  
  const $container = { padding: 20 }
  const $bottomContainerInsets = {}
  const $screenBackground = "background"
  
  const $sectionContainer = {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#000",
    borderRadius: 8,
  }

  const $statusContainer = {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    alignItems: "center" as const,
  }

  const $completeText = {
    color: "#28a745",
    fontWeight: "600" as const,
    fontSize: 16,
  }

  const $incompleteText = {
    color: "#ffc107",
    fontWeight: "600" as const,
    fontSize: 16,
  }

  const $scheduleText = {
    lineHeight: 20,
    whiteSpace: "pre-line" as const,
  }
  
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
  
