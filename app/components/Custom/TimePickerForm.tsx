import { useStores, DaySchedule, TimeRange } from "@/models"
import React, { useState, useCallback, useMemo } from "react"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
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

const days = ["L", "M", "X", "J", "V", "S", "D"]
const dayMapping: { [key: string]: string } = {
  L: "Lunes",
  M: "Martes",
  X: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado",
  D: "Domingo"
}

const hours = ["00:00", "06:00", "12:00", "18:00", "00:00"]

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

const totalMinutes = 24 * 60

export const TimePickerForm = observer(function TimePickerForm() {
  const { theme } = useAppTheme()
  const styles = createThemedStyles(theme)
  const [isStartPickerVisible, setStartPickerVisible] = useState(false)
  const [isEndPickerVisible, setEndPickerVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  
  const { requestStore } = useStores()

  // Safety check to prevent crashes if store is not available
  if (!requestStore) {
    console.error("RequestStore not available in TimePickerForm")
    return null
  }

  // Convert DaySchedule[] to a lookup object for easier rendering - memoized
  const getTimeSlotsByDay = useCallback((day: string): TimeRange[] => {
    try {
      const dayName = dayMapping[day]
      const daySchedule = requestStore.schedules.find((schedule) => schedule.day === dayName)
      return daySchedule ? daySchedule.timeSlots.slice() : []
    } catch (error) {
      console.error('Error getting time slots for day:', day, error)
      return []
    }
  }, [requestStore.schedules])

  // Memoize the formatTime function
  const formatTime = useCallback((date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
  , [])

  const toggleDay = useCallback((day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }, [])

  const applySelection = useCallback(() => {
    try {
      if (!start || !end || selectedDays.length === 0) {
        alert("Seleccioná días y horarios válidos")
        return
      }

      // Validate time format
      const startMinutes = toMinutes(start)
      const endMinutes = toMinutes(end)
      
      if (isNaN(startMinutes) || isNaN(endMinutes) || startMinutes >= endMinutes) {
        alert("Horarios inválidos. El horario de fin debe ser posterior al de inicio.")
        return
      }

      // Convert selected days to DaySchedule format and add to store
      selectedDays.forEach((dayCode) => {
        const dayName = dayMapping[dayCode]
        const existingTimeSlots = getTimeSlotsByDay(dayCode)
        const newTimeSlot: TimeRange = { start, end }

        // Add the new time slot to existing ones
        const updatedTimeSlots = [...existingTimeSlots, newTimeSlot]

        // Update store for this specific day
        requestStore.setScheduleForDay(dayName, updatedTimeSlots)
      })

      console.log("Horarios guardados en el store:", requestStore.schedules.slice())
      setModalVisible(false)
      setSelectedDays([])
      setStart("")
      setEnd("")
    } catch (error) {
      console.error("Error applying selection:", error)
      alert("Error al guardar los horarios")
    }
  }, [start, end, selectedDays, getTimeSlotsByDay, requestStore])

  const removeRange = useCallback((day: string, index: number) => {
    try {
      const dayName = dayMapping[day]
      const existingTimeSlots = getTimeSlotsByDay(day)

      // Validate index
      if (index < 0 || index >= existingTimeSlots.length) {
        console.warn(`Invalid index ${index} for day ${day}`)
        return
      }

      // Remove the time slot at the specified index
      const updatedTimeSlots = existingTimeSlots.filter((_, i) => i !== index)

      // Update store for this day
      requestStore.setScheduleForDay(dayName, updatedTimeSlots)

      console.log(`Rango eliminado para ${dayName}`)
    } catch (error) {
      console.error("Error removing range:", error)
    }
  }, [getTimeSlotsByDay, requestStore])

  // Memoize day columns for better performance
  const renderDayColumns = useMemo(() => {
    return days.map((day) => {
      const timeSlots = getTimeSlotsByDay(day)

      return (
        <View key={day} style={styles.dayColumn}>
          <View style={styles.bar}>
            {timeSlots.map(({ start, end }, i) => {
              try {
                const topValue = (toMinutes(start) / totalMinutes) * 240 // Use fixed pixel value instead of percentage
                const heightValue = ((toMinutes(end) - toMinutes(start)) / totalMinutes) * 240

                // Ensure valid values
                if (isNaN(topValue) || isNaN(heightValue) || topValue < 0 || heightValue <= 0) {
                  console.warn(`Invalid time slot values for day ${day}, slot ${i}:`, { start, end, topValue, heightValue })
                  return null
                }

                return (
                  <TouchableOpacity
                    key={`${day}-${i}-${start}-${end}`}
                    style={[
                      styles.segment,
                      {
                        top: Math.max(0, topValue),
                        height: Math.max(1, heightValue),
                      },
                    ]}
                    onLongPress={() => removeRange(day, i)}
                  >
                    {/* opcional: ícono o nada */}
                  </TouchableOpacity>
                )
              } catch (error) {
                console.error(`Error rendering time slot for day ${day}, slot ${i}:`, error)
                return null
              }
            })}
          </View>
          <Text style={styles.label}>{day === "X" ? "M" : day}</Text>
        </View>
      )
    })
  }, [getTimeSlotsByDay, removeRange])

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
          {renderDayColumns}
        </ScrollView>
        <TouchableOpacity
          style={[styles.openBtn, { marginTop: 10 }]}
          onPress={() => setModalVisible(true)}
        >
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
                  <TouchableOpacity
                    onPress={() => setStartPickerVisible(true)}
                    style={[styles.input, { flex: 1 }]}
                  >
                    <Text>{start || "Inicio"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setEndPickerVisible(true)}
                    style={[styles.input, { flex: 1 }]}
                  >
                    <Text>{end || "Fin"}</Text>
                  </TouchableOpacity>
                </View>

                <DateTimePickerModal
                  isVisible={isStartPickerVisible}
                  mode="time"
                  onConfirm={(date) => {
                    setStart(formatTime(date))
                    setStartPickerVisible(false)
                  }}
                  onCancel={() => setStartPickerVisible(false)}
                  is24Hour
                />

                <DateTimePickerModal
                  isVisible={isEndPickerVisible}
                  mode="time"
                  onConfirm={(date) => {
                    setEnd(formatTime(date))
                    setEndPickerVisible(false)
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
})

// Create theme-aware styles
const createThemedStyles = (theme: any) => StyleSheet.create({
  applyBtn: {
    backgroundColor: theme.colors.tint,
    borderRadius: 8,
    padding: 10,
  },
  applyText: {
    color: theme.colors.tintInverse,
    fontWeight: "bold",
    textAlign: "center",
  },
  bar: {
    width: 30,
    height: 240,
    backgroundColor: theme.colors.backgroundMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: "relative",
  },
  dayBtn: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    margin: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dayBtnSelected: {
    backgroundColor: theme.colors.tint,
    borderColor: theme.colors.tint,
  },
  dayButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  dayColumn: {
    alignItems: "center",
    marginHorizontal: 4,
  },
  dayText: {
    color: theme.colors.text,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    padding: 6,
    width: "45%",
  },
  inputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginTop: 6,
    color: theme.colors.text,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 20,
    width: "85%",
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    flex: 1,
    justifyContent: "center",
  },
  openBtn: {
    alignSelf: "center",
    backgroundColor: theme.colors.tint,
    borderRadius: 8,
    padding: 10,
  },
  openText: {
    color: theme.colors.tintInverse,
    fontWeight: "bold",
  },
  scroll: {
    flex: 1,
  },
  segment: {
    backgroundColor: theme.colors.tint,
    left: 0,
    opacity: 0.8,
    position: "absolute",
    width: "100%",
  },
  timeLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  timeLabels: {
    width: 35,
    height: 240,
    justifyContent: "space-between",
    marginRight: 4,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 10,
    color: theme.colors.text,
  },
  wrapper: {
    flexDirection: "row",
    padding: 20,
  },
})
