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
  Alert,
} from "react-native"
import { CustomTimePicker } from "./CustomTimePicker"

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

const fromMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Function to merge overlapping time slots
const mergeTimeSlots = (timeSlots: TimeRange[]): TimeRange[] => {
  if (timeSlots.length <= 1) return timeSlots

  // Convert to minutes and sort by start time
  const slotsInMinutes = timeSlots.map(slot => ({
    start: toMinutes(slot.start),
    end: toMinutes(slot.end),
    original: slot
  })).sort((a, b) => a.start - b.start)

  const merged: typeof slotsInMinutes = []
  let current = slotsInMinutes[0]

  for (let i = 1; i < slotsInMinutes.length; i++) {
    const next = slotsInMinutes[i]
    
    // Check if current and next overlap or are adjacent
    if (current.end >= next.start) {
      // Merge them - extend current to cover both
      current.end = Math.max(current.end, next.end)
    } else {
      // No overlap, add current to merged and move to next
      merged.push(current)
      current = next
    }
  }
  
  // Don't forget to add the last slot
  merged.push(current)

  // Convert back to time strings
  return merged.map(slot => ({
    start: fromMinutes(slot.start),
    end: fromMinutes(slot.end)
  }))
}

const totalMinutes = 24 * 60

export const TimePickerForm = observer(function TimePickerForm() {
  const { themed, theme } = useAppTheme()
  const styles = createThemedStyles(theme)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [start, setStart] = useState("09:00")
  const [end, setEnd] = useState("10:00")
  const [forceUpdate, setForceUpdate] = useState(0) // Add force update counter
  
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
  }, [requestStore.schedules]) // Made it depend on requestStore.schedules

  const handleStartTimeChange = useCallback((newStart: string) => {
    setStart(newStart)
    // If end time is not later than start time, adjust it
    const startMinutes = toMinutes(newStart)
    const endMinutes = toMinutes(end)
    if (endMinutes <= startMinutes) {
      // Set end time to 30 minutes after start time
      const newEndMinutes = startMinutes + 30
      if (newEndMinutes <= 23 * 60 + 30) { // Max time is 23:30
        setEnd(fromMinutes(newEndMinutes))
      }
    }
  }, [end])

  const handleEndTimeChange = useCallback((newEnd: string) => {
    setEnd(newEnd)
    // If start time is not earlier than end time, adjust it
    const startMinutes = toMinutes(start)
    const endMinutes = toMinutes(newEnd)
    if (startMinutes >= endMinutes) {
      // Set start time to 30 minutes before end time
      const newStartMinutes = endMinutes - 30
      if (newStartMinutes >= 0) { // Min time is 00:00
        setStart(fromMinutes(newStartMinutes))
      }
    }
  }, [start])

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

        // Add the new time slot to existing ones and merge overlapping slots
        const allTimeSlots = [...existingTimeSlots, newTimeSlot]
        const mergedTimeSlots = mergeTimeSlots(allTimeSlots)

        // Update store for this specific day with merged slots
        requestStore.setScheduleForDay(dayName, mergedTimeSlots)
      })

      // Force re-render
      setForceUpdate(prev => prev + 1)

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

      // Force re-render
      setForceUpdate(prev => prev + 1)

      console.log(`Rango eliminado para ${dayName}`)
    } catch (error) {
      console.error("Error removing range:", error)
    }
  }, [getTimeSlotsByDay, requestStore])
  const handleClearSchedules = () => {
    Alert.alert(
      "¿Borrar todos los horarios?",
      "Esta acción eliminará todos los horarios seleccionados.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Borrar", 
          style: "destructive", 
          onPress: () => {
            requestStore.setSchedules([])
            setForceUpdate(prev => prev + 1) // Force re-render
          }
        }
      ]
    )
  }
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
                        height: Math.max(8, heightValue), // Minimum height for visibility
                      },
                    ]}
                    onLongPress={() => removeRange(day, i)}
                  >
                    <View style={styles.segmentContent}>
                      <Text style={styles.segmentText}>
                        {start.slice(0,2)}h-{end.slice(0,2)}h
                      </Text>
                    </View>
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
  }, [getTimeSlotsByDay, removeRange, requestStore.schedules, forceUpdate]) // Added forceUpdate dependency

  return (
    <View style={styles.wrapper}>
      <View style={styles.timeLabels}>
        {hours.map((h, i) => (
          <Text key={i} style={[styles.timeLabel, i === 0 && { top: -5 }]}>
            {h}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: "column", alignItems: "center", flex: 1 }}>
        <ScrollView horizontal style={styles.scroll} showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", paddingHorizontal: 5 }}>
            {renderDayColumns}
          </View>
        </ScrollView>
        
        {/* Buttons Row */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.openBtn, styles.addButton]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.openText}>+ Agregar horarios</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearSchedules}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>🗑️ Borrar todo</Text>
          </TouchableOpacity>
        </View>
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

                <View style={{ marginVertical: 10 }}>
                  <CustomTimePicker
                    value={start}
                    onTimeChange={handleStartTimeChange}
                    label="Hora de inicio"
                    minTime="00:00"
                    maxTime="23:00"
                  />
                  
                  <CustomTimePicker
                    value={end}
                    onTimeChange={handleEndTimeChange}
                    label="Hora de fin"
                    minTime="00:30"
                    maxTime="23:30"
                  />
                </View>

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
    width: 36,
    height: 240,
    backgroundColor: theme.colors.backgroundMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: "relative",
    borderRadius: 4,
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
    marginHorizontal: 3,
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    elevation: 2,
    shadowColor: theme.colors.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    opacity: 0.9,
    position: "absolute",
    width: "100%",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  segmentContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  segmentText: {
    color: theme.colors.tintInverse,
    fontSize: 8,
    fontWeight: "bold",
  },
  timeLabel: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "bold",
  },
  timeLabels: {
    width: 30,
    height: 240,
    justifyContent: "space-between",
    marginRight: 8,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 10,
    color: theme.colors.text,
  },
  wrapper: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.sm,
  },
  clearButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    marginLeft: theme.spacing.sm,
    minWidth: 100,
    alignItems: "center",
  },
  clearButtonText: {
    color: theme.colors.tintInverse,
    fontWeight: "bold",
  },
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },
  addButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  }
})
