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
import { View, ScrollView } from "react-native"

type SchedulePickerScreenProps = NativeStackScreenProps<MainStackParamList, "SchedulePickerScreen">

export const SchedulePickerScreen = observer(function SchedulePickerScreen({
  route,
}: SchedulePickerScreenProps) {
  const { nextScreen } = route.params || {}
  const { themed, theme } = useAppTheme()
  const { requestStore } = useStores()
  const [updateKey, setUpdateKey] = useState(0)

  const navigation = useNavigation<NativeStackScreenProps<MainStackParamList>["navigation"]>()

  // Force update when schedules change
  useEffect(() => {
    setUpdateKey(prev => prev + 1)
  }, [requestStore.schedules])

  const handleNext = () => {
    // The TimePickerForm already manages the store directly, so we just navigate
    navigation.navigate("RequestConfirmationScreen" as any)
  }

  // Format selected schedules for display
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
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading" style={themed(texts.heading)}>
            Horarios 🕐
          </Text>
          <Text preset="subheading" style={[themed(texts.body), themed($subtitle)]}>
            Selecciona días y horarios disponibles
          </Text>
        </View>

        {/* Time Picker Form */}
        <TimePickerForm />
      </ScrollView>

      {/* Next Button - Fixed at bottom */}
      <View style={themed($buttonContainer)}>
        <Button
          text="Siguiente"
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

const $container = (theme: any) => ({ 
  flex: 1,
})

const $scrollContent = (theme: any) => ({
  paddingBottom: theme.spacing.lg,
})

const $header = (theme: any) => ({
  marginBottom: theme.spacing.lg,
  alignItems: "center" as const,
  paddingHorizontal: theme.spacing.md,
})

const $subtitle = (theme: any) => ({
  textAlign: "center" as const,
  marginTop: theme.spacing.xs,
})

const $selectedScheduleCard = (theme: any) => ({
  marginBottom: theme.spacing.md,
})

const $selectedLabel = (theme: any) => ({
  marginBottom: theme.spacing.xs,
})

const $selectedText = (theme: any) => ({
  lineHeight: 20,
})

const $noScheduleText = (theme: any) => ({
  textAlign: "center" as const,
  fontStyle: "italic" as const,
})

const $buttonContainer = (theme: any) => ({
  padding: theme.spacing.md,
  paddingBottom: theme.spacing.xl,
  borderTopWidth: 1,
})

const $nextButton = (theme: any) => ({
  marginTop: 0,
})
