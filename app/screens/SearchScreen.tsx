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
import { TimePickerForm } from "@/components/Custom/TimePickerForm"

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

  const [modalMode, setModalMode] = useState<
    "selectActivity" | "selectLocation" | "selectTime" | null
  >(null)
  const [selectedPreferences, setSelectedPreferences] = useState<any[]>([])

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      <Text preset="heading" text="Búsqueda" style={$heading} />

      <View style={styles.form}>
        <Text
          text="Actividad"
          style={{
            color: themed("primary"),
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 12,
          }}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {selectedPreferences.length > 0 && (
            <View style={{ marginBottom: 8, width: "100%" }}>
              <Text style={{ color: themed("text"), fontWeight: "bold" }}>Seleccionadas</Text>
            </View>
          )}

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {selectedPreferences.map((pref) => (
              <View
                key={pref.id}
                style={{
                  backgroundColor: "#eaeaea",
                  paddingHorizontal: 5,
                  paddingVertical: 6,
                  borderRadius: 12,
                  marginRight: 4,
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: themed("text") }}>{`${pref.emoji} ${pref.name}`}</Text>
              </View>
            ))}
          </View>
          <View style={{ width: "100%", marginTop: 8 }}>
            <Button text="Seleccionar actividad" onPress={() => setModalMode("selectActivity")} />
          </View>
        </View>

        <Text text="Ubicación" />
        <Button text="Seleccionar en mapa" onPress={() => {}} />
            <TimePickerForm/>
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
        visible={modalMode === "selectActivity"}
        transparent
        animationType="slide"
        onRequestClose={() => setModalMode(null)}
      >
       <View style={modalStyles.overlay}>
  <View style={modalStyles.content}>
    <View style={{ flex: 1 }}>
      <ActivitiesForm
        selectedPreferences={selectedPreferences}
        setSelectedPreferences={setSelectedPreferences}
      />
    </View>

    <View style={modalStyles.footer}>
      <Button text="Aceptar" onPress={() => setModalMode(null)} />
      <Button text="Cerrar" onPress={() => setModalMode(null)} />
    </View>
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
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    flex: 1,
  },

footer: {
  padding: 16,
  borderTopWidth: 1,
  borderColor: "#ddd",
  backgroundColor: "#fff",
},
})

