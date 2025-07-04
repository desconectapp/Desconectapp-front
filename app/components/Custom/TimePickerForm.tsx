import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"

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

  const [isStartPickerVisible, setStartPickerVisible] = useState(false)
  const [isEndPickerVisible, setEndPickerVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
   const [selectedTime, setSelectedTime] = useState<SelectedTime>({
    L: [
      { start: "08:00", end: "10:00" },
      { start: "14:00", end: "16:00" },
    ],
    X: [{ start: "09:30", end: "11:30" }],
    V: [
      { start: "13:00", end: "15:00" },
      { start: "16:00", end: "18:00" },
    ],
  });
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const applySelection = () => {
    if (!start || !end || selectedDays.length === 0) {
      alert("Seleccioná días y horarios válidos");
      return;
    }

    const updated: SelectedTime = { ...selectedTime };

    selectedDays.forEach((day) => {
      if (!updated[day]) updated[day] = [];
      updated[day] = [...updated[day], { start, end }];
    });

    console.log("Horarios seleccionados:", updated);
    setSelectedTime(updated);
    setModalVisible(false);
    setSelectedDays([]);
    setStart("");
    setEnd("");
  };
const removeRange = (day: string, index: number) => {
  setSelectedTime((prev) => {
    const updated = { ...prev };
    updated[day] = updated[day].filter((_, i) => i !== index);
    if (updated[day].length === 0) delete updated[day];
    console.log("Rango eliminado:", updated);
    return updated;
  });

};

  return (
    <View style={styles.wrapper}>
      <View style={styles.timeLabels}>
        {hours.map((h, i) => (
          <Text key={i} style={[styles.timeLabel, i === 0 && { top: -5 }]}>
            {h}
          </Text>
        ))}
      </View>
<View style={{ flexDirection: "column", alignItems: "center" }}>

      <ScrollView horizontal style={styles.scroll}>
        {days.map((day) => (
          <View key={day} style={styles.dayColumn}>
            <View style={styles.bar}>
              {(selectedTime[day] || []).map(({ start, end }, i) => {
                const top = (toMinutes(start) / totalMinutes) * 100
                const height = ((toMinutes(end) - toMinutes(start)) / totalMinutes) * 100

                return (
                  <TouchableOpacity
  key={i}
  style={[
    styles.segment,
    {
      top: `${top}%`,
      height: `${height}%`,
    },
  ]}
  onLongPress={() => removeRange(day, i)}
>
  {/* opcional: ícono o nada */}
</TouchableOpacity>
                )
              })}
            </View>
            <Text style={styles.label}>{day === "X" ? "M" : day}</Text>
          </View>
        ))}
      </ScrollView>
       <TouchableOpacity style={[styles.openBtn, { marginTop: 10 }]} onPress={() => setModalVisible(true)}>
    <Text style={styles.openText}>Agregar horarios</Text>
  </TouchableOpacity>
      </View>


      <Modal visible={modalVisible} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>

        <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback>

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

           <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
  <TouchableOpacity onPress={() => setStartPickerVisible(true)} style={[styles.input, { flex: 1 }]}>
    <Text>{start || "Inicio"}</Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => setEndPickerVisible(true)} style={[styles.input, { flex: 1 }]}>
    <Text>{end || "Fin"}</Text>
  </TouchableOpacity>
</View>

            <DateTimePickerModal
              isVisible={isStartPickerVisible}
              mode="time"
              onConfirm={(date) => {
                setStart(formatTime(date));
                setStartPickerVisible(false);
              }}
              onCancel={() => setStartPickerVisible(false)}
              is24Hour
            />

            <DateTimePickerModal
              isVisible={isEndPickerVisible}
              mode="time"
              onConfirm={(date) => {
                setEnd(formatTime(date));
                setEndPickerVisible(false);
              }}
              onCancel={() => setEndPickerVisible(false)}
              is24Hour
            />

            <TouchableOpacity style={styles.applyBtn} onPress={applySelection}>
              <Text style={styles.applyText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
                </TouchableWithoutFeedback>

        </View>
              </TouchableWithoutFeedback>

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
