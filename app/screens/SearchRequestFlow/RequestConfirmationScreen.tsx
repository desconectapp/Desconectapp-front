import { Button, Screen, Text } from "@/components"
import { MainStackParamList } from "@/navigators/MainNavigator"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { Alert, View } from "react-native"
import { observer } from "mobx-react-lite"
import { useStores } from "@/models"
import { useSearch } from "@/hooks/Search"
import { containers, buttons, buttonTexts, texts } from "@/theme/commonStyles"
import { useAppToast } from "@/components/useToast"

type RequestConfirmationScreenProps = NativeStackScreenProps<MainStackParamList, "RequestConfirmationScreen">

export const RequestConfirmationScreen = observer(function RequestConfirmationScreen({ route }: RequestConfirmationScreenProps) {
  const { themed, theme } = useAppTheme()
  const navigation = useNavigation<NativeStackScreenProps<MainStackParamList>["navigation"]>()
  const { requestStore } = useStores()
  const search = useSearch()
  const { showToast } = useAppToast()

  const formatSchedules = () => {
    if (requestStore.schedules.length === 0) {
      return "No hay horarios seleccionados"
    }
    
    return requestStore.schedules.map(daySchedule => {
      const timeSlotTexts = daySchedule.timeSlots.map(slot => `${slot.start} - ${slot.end}`)
      return `${daySchedule.day}: ${timeSlotTexts.join(", ")}`
    }).join("\n")
  }

  const formatLocation = () => {
    if (!requestStore.location) {
      return "No hay ubicación seleccionada"
    }
    const parts = requestStore.location.address.split(", ")
    return parts.length > 2 ? `${parts[1]}, ${parts[2]}` : requestStore.location.address
  }

  const handleSearch = () => {
    const requestData = requestStore.getRequestData()
    console.log("Datos de la búsqueda:", JSON.stringify(requestData, null, 2))

    search.mutateAsync(requestData)
      .then(() => {
        console.log("Búsqueda realizada con éxito")
        showToast("¡Búsqueda creada! 🎉", "Pronto te notificaremos cuando encontremos coincidencias")
        requestStore.clearRequest()
        navigation.navigate("Tabs")
      })
      .catch(error => {
        console.error("Error al realizar la búsqueda:", error)
        Alert.alert("Error", "No se pudo realizar la búsqueda. Inténtalo de nuevo más tarde.")
      })
  }
  
  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[containers.screen, themed($container)]}
      backgroundColor={themed(() => theme.colors.background)}
    >
      {/* Header */}
      <Text preset="heading" style={[themed(texts.heading), themed($title)]}>
        ¡Todo listo para buscar!
      </Text>
    
      
      {/* Activity Section */}
      <View style={[themed(containers.card), themed($section)]}>
        <Text style={themed(texts.label)}>Actividad</Text>
        <Text style={themed(texts.body)}>
          {requestStore.activity ? requestStore.activity.name : "No seleccionada"}
        </Text>
      </View>

      {/* Participants Section */}
      <View style={[themed(containers.card), themed($section)]}>
        <Text style={themed(texts.label)}>Participantes</Text>
        <Text style={themed(texts.body)}>
          De {requestStore.minParticipants} a {requestStore.maxParticipants} personas
        </Text>
      </View>

      {/* Location Section */}
      <View style={[themed(containers.card), themed($section)]}>
        <Text style={themed(texts.label)}>Ubicación</Text>
        <Text style={themed(texts.body)}>{formatLocation()}</Text>
        {requestStore.location && (
          <Text style={themed(texts.caption)}>
            Radio de {requestStore.radiusKm} km
          </Text>
        )}
      </View>

      {/* Schedule Section */}
      <View style={[themed(containers.card), themed($section)]}>
        <Text style={themed(texts.label)}>Horarios</Text>
        <Text style={[themed(texts.body), themed($scheduleText)]}>
          {formatSchedules()}
        </Text>
      </View>

      {/* Search Button */}
      <Button
        text="🔍 Buscar"
        style={[themed(buttons.primary), themed($searchButton)]}
        textStyle={themed(buttonTexts.primary)}
        onPress={handleSearch}
      />
    </Screen>
  )
})

const $container = (theme: any) => ({
  paddingBottom: theme.spacing.lg,
})

const $title = (theme: any) => ({
  textAlign: "center" as const,
  marginBottom: theme.spacing.lg,
})

const $statusComplete = (theme: any) => ({
  backgroundColor: theme.colors.palette.success100,
  borderColor: theme.colors.palette.success500,
  borderWidth: 1,
})

const $statusIncomplete = (theme: any) => ({
  backgroundColor: theme.colors.palette.warning100,
  borderColor: theme.colors.palette.warning500,
  borderWidth: 1,
})

const $section = (theme: any) => ({
  marginBottom: theme.spacing.md,
})

const $scheduleText = (theme: any) => ({
  lineHeight: 20,
})

const $searchButton = (theme: any) => ({
  marginTop: theme.spacing.lg,
})