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
import LocationForm from "@/components/Custom/LocationForm"

import MapView from "react-native-maps"

export function SearchScreen() {
  const { themed } = useAppTheme()

  const [modalMode, setModalMode] = useState<
    "selectActivity" | "selectLocation" | "selectTime" | null
  >(null)
  const [selectedPreferences, setSelectedPreferences] = useState<any[]>([])
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  
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

          <Text
          text="Ubicacion"
          style={{
            color: themed("primary"),
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 12,
          }}
        />


        <Button
          text="Seleccionar en mapa"
          onPress={() => {
            setModalMode("selectLocation")
          }}
        />
        {selectedCoordinates && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ color: themed("text") }}>
              Ubicación seleccionada: {selectedCoordinates.latitude},{" "}
              {selectedCoordinates.longitude}
            </Text>
          </View>
        )}

        <Text
          text="Dias y horarios"
          style={{
            color: themed("primary"),
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 12,
          }}
        />
        <Button
          text="Seleccionar horarios"
          onPress={() => {
            setModalMode("selectTime")
          }}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 130,
            alignContent: "center",
          }}
        >
          <TouchableOpacity style={styles.searchButton} onPress={() => {}} activeOpacity={0.7}>
            <Text style={styles.text}>🔍</Text>
          </TouchableOpacity>
         
        </View>
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
      <Modal
        visible={modalMode === "selectLocation"}
        transparent
        animationType="slide"
        onRequestClose={() => setModalMode(null)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <View style={{ flex: 1 }}>
              <Text
                text="Seleccionar ubicación"
                style={{
                  color: themed("primary"),
                  fontSize: 20,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: 12,
                }}
              />
              <LocationForm
                selectedCoordinates={selectedCoordinates}
                setSelectedCoordinates={setSelectedCoordinates}
              />
            </View>

            <View style={modalStyles.footer}>
              <Button text="Aceptar" onPress={() => setModalMode(null)} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalMode === "selectTime"}
        transparent
        animationType="slide"
        onRequestClose={() => setModalMode(null)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <View style={{ flex: 1 }}>
              <Text
                text="Dias y horarios"
                style={{
                  color: themed("primary"),
                  fontSize: 20,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: 12,
                }}
              />
              <TimePickerForm
              />
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
  searchButton: {
    backgroundColor: "#ff5c5c",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Android
    shadowColor: "#000", // iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  text: {
    fontSize: 24,
    color: "white",
  },
})

const $container = { padding: 20 }
const $bottomContainerInsets = {}
const $screenBackground = "background"
const $heading = { marginBottom: 16 }

const modalStyles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },

  content: {
    width: "90%", // o tamaño que quieras
    maxHeight: "40%",
    height: 500,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 10,
    overflow: "hidden",
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
})
