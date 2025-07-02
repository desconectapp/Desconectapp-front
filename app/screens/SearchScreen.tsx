import React, { useState } from "react"
import { Screen } from "../components/Screen"
import { Text } from "../components/Text"
import { TextField } from "../components/TextField"
import { Button } from "../components/Button"
import { View, StyleSheet, Platform } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "@/navigators"

export function SearchScreen() {
  const [activity, setActivity] = useState("")
  const [customActivity, setCustomActivity] = useState("")
  const [showStartTime, setShowStartTime] = useState(false)
  const [showEndTime, setShowEndTime] = useState(false)
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const { themed } = useAppTheme()
  const navigator = useNavigation<AppStackScreenProps<"ProfileScreen">["navigation"]>()
  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      <Text preset="heading" text="Búsqueda" style={$heading} />

      <View style={styles.form}>
        <Text text="Actividad" />
        <Picker
          selectedValue={activity}
          onValueChange={(value:any) => setActivity(value)}
        >
          <Picker.Item label="Seleccioná una actividad" value="" />
          <Picker.Item label="Fútbol" value="Fútbol" />
          <Picker.Item label="Yoga" value="Yoga" />
          <Picker.Item label="Gimnasio" value="Gimnasio" />
          <Picker.Item label="Otra..." value="Otra" />
        </Picker>

        {activity === "Otra" && (
          <TextField
            label="Otra actividad"
            placeholder="Especificá la actividad"
            value={customActivity}
            onChangeText={setCustomActivity}
          />
        )}

        <Text text="Ubicación" />
        <Button text="Seleccionar en mapa" onPress={() => {}} />

        <Text text="Horario disponible" />
        <Button
          text={`Desde: ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          onPress={() => setShowStartTime(true)}
        />
        <Button
          text={`Hasta: ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          onPress={() => setShowEndTime(true)}
        />
      
        <Button text="Buscar" style={styles.button}
          onPress={() => {
            navigator.navigate("ProfileScreen")
          }}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
    marginTop: 24,
  },
  button: {
    marginTop: 24,
  },
})

const $container = { padding: 20 }
const $bottomContainerInsets = {}
const $screenBackground = "background"
const $heading = { marginBottom: 16 }
