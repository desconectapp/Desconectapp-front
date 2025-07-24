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
  
  const navigation = useNavigation<AppStackScreenProps<"Main">["navigation"]>()


  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      <Text preset="heading" text="Búsqueda" style={$heading} />

      <View style={styles.form}>
      
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 130,
            alignContent: "center",
          }}
        >
          <TouchableOpacity style={styles.searchButton} onPress={() => {navigation.navigate("ActivityPickerScreen")}} activeOpacity={0.7}>
            <Text style={styles.text}>Busqueda 🔍</Text>
          </TouchableOpacity>
         
        </View>
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
  searchButton: {
    backgroundColor: "#ff5c5c",
    width: 300,
    height: 150,
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
