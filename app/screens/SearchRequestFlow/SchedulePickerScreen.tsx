import { Button, Screen, Text } from "@/components"
import { MainStackParamList } from "@/navigators/MainNavigator"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { containers, buttons, buttonTexts, texts } from "@/theme/commonStyles"
import { useState, useEffect } from "react"

import { TimePickerForm } from "@/components/Custom/TimePickerForm"
import { View, ScrollView, Alert, ViewStyle, TextStyle } from "react-native"

type SchedulePickerScreenProps = NativeStackScreenProps<MainStackParamList, "SchedulePickerScreen">

export const SchedulePickerScreen = observer(function SchedulePickerScreen({
  route,
}: SchedulePickerScreenProps) {
  const { nextScreen, onScheduleSelect } = route.params || {}
  const { themed, theme } = useAppTheme()
  const { requestStore } = useStores()
  const [updateKey, setUpdateKey] = useState(0)

  const navigation = useNavigation<NativeStackScreenProps<MainStackParamList>["navigation"]>()

  useEffect(() => {
    setUpdateKey(prev => prev + 1)
  }, [requestStore.schedules])

  const handleNext = () => {
    if (!requestStore.isScheduleSelected) {
        Alert.alert("Selección Requerida", "Por favor, selecciona al menos un día y horario disponible.")
        return
    }

    if (onScheduleSelect) {
        onScheduleSelect(requestStore.schedules)
        navigation.goBack()

    } else {
        navigation.navigate("RequestConfirmationScreen" as any)
    }
  }

  const formatSchedules = () => {
    if (!requestStore.schedules || requestStore.schedules.length === 0) {
      return "Ningún horario seleccionado"
    }

    const formatted = requestStore.schedules.map(schedule => {
      const timeSlots = schedule.timeSlots.map(slot => `${slot.start}-${slot.end}`).join(", ")
      return `📅 ${schedule.day}: ${timeSlots}`
    }).join("\n")
    
    return formatted
  }

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={[containers.screen, themed($container)]}
      backgroundColor={themed(() => theme.colors.background)}
      safeAreaEdges={["top"]}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themed($scrollContent)}
      >
        <View style={themed($header)}>
          <Text preset="heading" style={themed(texts.heading)}>
            Horarios 🕐
          </Text>
          <Text preset="subheading" style={[themed(texts.body), themed($subtitle)]}>
            Selecciona días y horarios disponibles
          </Text>
        </View>

        <TimePickerForm />
      </ScrollView>

      <View style={themed($buttonContainer)}>
        <Button
          text={onScheduleSelect ? "Seleccionar" : "Siguiente"}
          style={[
            themed(buttons.primary),
            themed($nextButton),
            !requestStore.isScheduleSelected && themed(buttons.primaryDisabled)
          ]}
          textStyle={[
            themed(buttonTexts.primary),
            !requestStore.isScheduleSelected && themed(buttonTexts.primaryDisabled)
          ]}
          disabled={!requestStore.isScheduleSelected}
          onPress={handleNext}
        />
      </View>
    </Screen>
  )
})

const $container = (theme: any): ViewStyle => ({ 
  flex: 1,
})

const $scrollContent = (theme: any): ViewStyle => ({
  paddingBottom: theme.spacing.lg,
})

const $header = (theme: any): ViewStyle => ({
  marginBottom: theme.spacing.lg,
  alignItems: "center" as const,
  paddingHorizontal: theme.spacing.md,
})

const $subtitle = (theme: any): TextStyle => ({
  textAlign: "center" as const,
  marginTop: theme.spacing.xs,
})


const $buttonContainer = (theme: any): ViewStyle => ({
  padding: theme.spacing.md,
  paddingBottom: theme.spacing.xl,
  borderTopWidth: 1,
})

const $nextButton = (theme: any): ViewStyle => ({
  marginTop: 0,
})