import { Button, Screen, Text } from "@/components"
import { MainStackParamList } from "@/navigators/MainNavigator"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { Alert, Pressable, View } from "react-native"
import { observer } from "mobx-react-lite"
import { useStores } from "@/models"
import { useSearch } from "@/hooks/Search"
import { containers, buttons, buttonTexts, texts } from "@/theme/commonStyles"
import { useAppToast } from "@/components/useToast"

import { FontAwesome } from "@expo/vector-icons"

type RequestConfirmationScreenProps = NativeStackScreenProps<
  MainStackParamList,
  "RequestConfirmationScreen"
>

export const RequestConfirmationScreen = observer(function RequestConfirmationScreen({
  route,
}: RequestConfirmationScreenProps) {
  let isAiGenerated = false
  if (route.params !== undefined) {
    const { isAiGenerated: s } = route.params
    isAiGenerated = s ?? false
  }

  const { themed, theme } = useAppTheme()
  const navigation = useNavigation<NativeStackScreenProps<MainStackParamList>["navigation"]>()
  const { requestStore, sessionStore } = useStores()
  const search = useSearch()
  const { showToast } = useAppToast()

  const formatSchedules = () => {
    if (requestStore.schedules.length === 0) {
      return "No hay horarios seleccionados"
    }

    return requestStore.schedules
      .map((daySchedule) => {
        const timeSlotTexts = daySchedule.timeSlots.map((slot) => `${slot.start} - ${slot.end}`)
        return `${daySchedule.day}: ${timeSlotTexts.join(", ")}`
      })
      .join("\n")
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

    const requestDataWithUser = {
      ...requestData,
      user_id: sessionStore.user_id,
      user_uuid: sessionStore.user_uuid,
    }

    console.log("Datos de la búsqueda:", JSON.stringify(requestDataWithUser, null, 2))

    search.mutate(requestDataWithUser, {
      onSuccess: () => {
        console.log("Búsqueda realizada con éxito")
        showToast(
          "¡Búsqueda creada! 🎉",
          "Pronto te notificaremos cuando encontremos coincidencias",
        )
        // requestStore.clearRequest()
        navigation.navigate("Tabs")
      },
      onError: (error) => {
        console.error("Error al realizar la búsqueda:", error)
        Alert.alert("Error", "No se pudo realizar la búsqueda. Inténtalo de nuevo más tarde.")
      },
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

      {isAiGenerated && (
        <View
          style={{
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: "rgba(120, 80, 255, 0.15)", // violeta suave translúcido
            borderWidth: 1,
            borderColor: "rgba(160, 130, 255, 0.4)",
            marginBottom: 15,
          }}
        >
          <FontAwesome name="star" size={14} color="#A68CFF" />
          <Text style={{ color: "#595259", fontSize: 14, fontWeight: "800" }}>
            Generado por Asistente de Búsquedas
          </Text>
        </View>
      )}

      {/* Activity Section */}
      <Pressable
        onPress={() =>
          navigation.navigate("ActivityPickerScreen", { nextScreen: "RequestConfirmationScreen" })
        }
        style={({ pressed }) => [
          themed(containers.card),
          themed($section),
          { position: "relative" },
          pressed && { opacity: 0.6 },
        ]}
      >
        <Text style={themed(texts.label)}>Actividad</Text>
        <Text style={themed(texts.body)}>
          {requestStore.activity ? requestStore.activity.name : "No seleccionada"}
        </Text>

        <View style={{ position: "absolute", top: 15, right: 15 }}>
          <FontAwesome name="pencil" size={20} color={theme.colors.textDim} />
        </View>
      </Pressable>

      {/* Participants Section */}
      <Pressable
        onPress={() =>
          navigation.navigate("ActivityPickerScreen", { nextScreen: "RequestConfirmationScreen" })
        }
        style={({ pressed }) => [
          themed(containers.card),
          themed($section),
          { position: "relative" },
          pressed && { opacity: 0.6 },
        ]}
      >
        <Text style={themed(texts.label)}>Participantes</Text>
        <Text style={themed(texts.body)}>
          De {requestStore.minParticipants} a {requestStore.maxParticipants} personas
        </Text>

        <View style={{ position: "absolute", top: 15, right: 15 }}>
          <FontAwesome name="pencil" size={20} color={theme.colors.textDim} />
        </View>
      </Pressable>

      {/* Location Section */}
      <Pressable
        onPress={() =>
          navigation.navigate("LocationPickerScreen", { nextScreen: "RequestConfirmationScreen" })
        }
        style={({ pressed }) => [
          themed(containers.card),
          themed($section),
          { position: "relative" },
          pressed && { opacity: 0.6 },
        ]}
      >
        <Text style={themed(texts.label)}>Ubicación</Text>
        <Text style={themed(texts.body)}>{formatLocation()}</Text>

        {requestStore.location && (
          <Text style={themed(texts.caption)}>Radio de {requestStore.radiusKm} km</Text>
        )}

        <View style={{ position: "absolute", top: 15, right: 15 }}>
          <FontAwesome name="pencil" size={20} color={theme.colors.textDim} />
        </View>
      </Pressable>

      {/* Schedule Section */}
      <Pressable
        onPress={() =>
          navigation.navigate("SchedulePickerScreen", { nextScreen: "RequestConfirmationScreen" })
        }
        style={({ pressed }) => [
          themed(containers.card),
          themed($section),
          { position: "relative" },
          pressed && { opacity: 0.6 },
        ]}
      >
        <Text style={themed(texts.label)}>Horarios</Text>
        <Text style={[themed(texts.body), themed($scheduleText)]}>{formatSchedules()}</Text>

        <View style={{ position: "absolute", top: 15, right: 15 }}>
          <FontAwesome name="pencil" size={20} color={theme.colors.textDim} />
        </View>
      </Pressable>

      {/* Search Button */}
      <Button
        text="Confirmar Busqueda 🔍"
        style={[themed(buttons.primary), themed($searchButton)]}
        pressedStyle={themed(buttons.primaryPressed)}
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
