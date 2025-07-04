import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native"

const days = ["D", "L", "M", "X", "J", "V", "S"]
const hours = ["00:00", "06:00", "12:00", "18:00", "00:00"]

type SelectedTime = {
  [day: string]: {
    start: string
    end: string
  }[]
}
const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

const totalMinutes = 24 * 60

const selectedTime: SelectedTime = {
  L: [
    { start: "08:00", end: "10:00" },
    { start: "14:00", end: "16:00" },
  ],
  X: [{ start: "09:30", end: "11:30" }],
  V: [
    { start: "13:00", end: "15:00" },
    { start: "16:00", end: "18:00" },
  ],
}

export function TimePickerForm() {
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const applySelection = () => {
    console.log("Aplicar a:", selectedDays, "de", start, "a", end)
    // lógica para guardar esto en selectedTime...
    setModalVisible(false)
    setSelectedDays([])
    setStart("")
    setEnd("")
  }
  return (
    <View style={styles.wrapper}>
      <View style={styles.timeLabels}>
        {hours.map((h, i) => (
          <Text key={i} style={[styles.timeLabel, i === 0 && { top: -5 }]}>
            {h}
          </Text>
        ))}
      </View>

      <ScrollView horizontal style={styles.scroll}>
        {days.map((day) => (
          <View key={day} style={styles.dayColumn}>
            <View style={styles.bar}>
              {(selectedTime[day] || []).map(({ start, end }, i) => {
                const top = (toMinutes(start) / totalMinutes) * 100
                const height = ((toMinutes(end) - toMinutes(start)) / totalMinutes) * 100

                return (
                  <View
                    key={i}
                    style={[
                      styles.segment,
                      {
                        top: `${top}%`,
                        height: `${height}%`,
                      },
                    ]}
                  />
                )
              })}
            </View>
            <Text style={styles.label}>{day === "X" ? "M" : day}</Text>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.openBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.openText}>Agregar rango</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Seleccionar días</Text>

            <View style={styles.dayButtons}>
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayBtn, selectedDays.includes(day) && styles.dayBtnSelected]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={styles.dayText}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.title}>Horario</Text>
            <View style={styles.inputs}>
              <TextInput
                placeholder="Inicio (HH:MM)"
                value={start}
                onChangeText={setStart}
                style={styles.input}
              />
              <TextInput
                placeholder="Fin (HH:MM)"
                value={end}
                onChangeText={setEnd}
                style={styles.input}
              />
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={applySelection}>
              <Text style={styles.applyText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    padding: 20,
  },
  timeLabels: {
    width: 35, // antes 50
    height: 240,
    justifyContent: "space-between",
    marginRight: 4, // antes 10
  },
  timeLabel: {
    fontSize: 12,
    color: "#555",
  },
  scroll: {
    flex: 1,
  },
  dayColumn: {
    alignItems: "center",
    marginHorizontal: 4, // antes 8
  },
  bar: {
    width: 30, // antes 40
    height: 240,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#ccc",
    position: "relative",
  },
  segment: {
    position: "absolute",
    left: 0,
    width: "100%",
    backgroundColor: "#4caf50",
    opacity: 0.8,
  },
  label: {
    marginTop: 6,
    fontWeight: "bold",
  },
  openBtn: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 8,
    alignSelf: "center",
  },
  openText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  dayButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  dayBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  dayBtnSelected: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  dayText: {
    color: "#000",
  },
  inputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 6,
    width: "45%",
  },
  applyBtn: {
    backgroundColor: "#2196f3",
    padding: 10,
    borderRadius: 8,
  },
  applyText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
})
