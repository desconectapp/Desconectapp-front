import React, { useState } from "react"
import { Screen } from "../components/Screen"
import { Text } from "../components/Text"
import { TextField } from "../components/TextField"
import { Button } from "../components/Button"
import { View, StyleSheet, Platform, TouchableOpacity, Modal } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "@/navigators"
import { useActivities } from "@/hooks/Users"
import { ActivitiesForm } from "@/components/Custom/ActivitiesForm"

export function SearchScreen() {
  const [activity, setActivity] = useState("")
  const [customActivity, setCustomActivity] = useState("")
  const [showStartTime, setShowStartTime] = useState(false)
  const [showEndTime, setShowEndTime] = useState(false)
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const { themed } = useAppTheme()
  const navigator = useNavigation<AppStackScreenProps<"ProfileScreen">["navigation"]>()

  const { data: activities, isLoading: loadingActivities, error } = useActivities()

  const [showForm, setShowForm] = useState(false)
  const [selectedPreferences, setSelectedPreferences] = useState<any[]>([])

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      <Text preset="heading" text="Búsqueda" style={$heading} />

      <View style={styles.form}>
        <Text text="Actividad" style={{ color: themed("primary") }} />

        <Button text="Seleccionar actividad" onPress={() => {setShowForm(true)}} />
        {selectedPreferences.length > 0 &&
          selectedPreferences.map((pref) => (
            <Text
              key={pref.id}
              text={`${pref.id} ${pref.activity}`}
              style={{ color: themed("text") }}
            />
          ))}

        <Text text="Ubicación" />
        <Button text="Seleccionar en mapa" onPress={() => {}} />

        <Text text="Horario disponible" />
        <Button
          text={`Desde: ${startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          onPress={() => setShowStartTime(true)}
        />
        <Button
          text={`Hasta: ${endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          onPress={() => setShowEndTime(true)}
        />

        <Button
          text="Buscar"
          style={styles.button}
          onPress={() => {
            navigator.navigate("ProfileScreen")
          }}
        />
      </View>

      <Modal
        visible={showForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForm(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <ActivitiesForm
              selectedPreferences={selectedPreferences}
              setSelectedPreferences={setSelectedPreferences}
            />
            <Button text="Cerrar" onPress={() => setShowForm(false)} />
          </View>
        </View>
      </Modal>
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
})
