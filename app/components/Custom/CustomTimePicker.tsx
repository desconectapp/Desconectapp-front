import React, { useState, useRef } from "react"
import { View, TouchableOpacity, StyleSheet, Vibration, TextInput } from "react-native"
import { Text } from "../Text"
import { useAppTheme } from "../../utils/useAppTheme"

interface CustomTimePickerProps {
  value: string // Format: "HH:MM"
  onTimeChange: (time: string) => void
  label?: string
  minTime?: string // Minimum allowed time (HH:MM format)
  maxTime?: string // Maximum allowed time (HH:MM format)
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onTimeChange,
  label,
  minTime = "00:00",
  maxTime = "23:30"
}) => {
  const { theme } = useAppTheme()
  const { colors } = theme
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value)
  const inputRef = useRef<TextInput>(null)

  // Convert time string to minutes from midnight
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  // Convert minutes from midnight to time string
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
  }

  // Round time to nearest 30-minute block
  const roundToNearestBlock = (time: string): string => {
    const minutes = timeToMinutes(time)
    const roundedMinutes = Math.round(minutes / 30) * 30
    return minutesToTime(roundedMinutes)
  }

  // Validate and format manual input
  const validateTimeInput = (input: string): string | null => {
    // Remove any non-digit and non-colon characters
    const cleaned = input.replace(/[^\d:]/g, '')
    
    // Check basic format (H:MM or HH:MM)
    const timeRegex = /^(\d{1,2}):(\d{2})$/
    const match = cleaned.match(timeRegex)
    
    if (!match) return null
    
    const hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    
    // Validate ranges
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
    
    // Format to HH:MM
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    
    // Round to nearest 30-minute block
    return roundToNearestBlock(formattedTime)
  }

  const handleInputFocus = () => {
    setIsEditing(true)
    setTempValue(value)
  }

  const handleInputChangeText = (text: string) => {
    // Auto-format as user types
    let cleaned = text.replace(/[^\d]/g, '') // Remove non-digits
    
    if (cleaned.length >= 3) {
      // Insert colon after first 1-2 digits
      cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4)
    }
    
    setTempValue(cleaned)
  }

  const handleInputBlur = () => {
    setIsEditing(false)
    const validated = validateTimeInput(tempValue)
    if (validated) {
      const validatedMinutes = timeToMinutes(validated)
      const minMinutes = timeToMinutes(minTime)
      const maxMinutes = timeToMinutes(maxTime)
      
      // Ensure within bounds
      const boundedMinutes = Math.max(minMinutes, Math.min(maxMinutes, validatedMinutes))
      const finalTime = minutesToTime(boundedMinutes)
      
      onTimeChange(finalTime)
    } else {
      // Reset to current value if invalid
      setTempValue(value)
    }
  }

  const handleInputSubmit = () => {
    inputRef.current?.blur()
  }

  const currentMinutes = timeToMinutes(value)
  const minMinutes = timeToMinutes(minTime)
  const maxMinutes = timeToMinutes(maxTime)

  const increment = () => {
    const newMinutes = Math.min(currentMinutes + 30, maxMinutes)
    if (newMinutes !== currentMinutes) {
      Vibration.vibrate(50) // Haptic feedback
      onTimeChange(minutesToTime(newMinutes))
    }
  }

  const decrement = () => {
    const newMinutes = Math.max(currentMinutes - 30, minMinutes)
    if (newMinutes !== currentMinutes) {
      Vibration.vibrate(50) // Haptic feedback
      onTimeChange(minutesToTime(newMinutes))
    }
  }

  const canIncrement = currentMinutes < maxMinutes
  const canDecrement = currentMinutes > minMinutes

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      marginVertical: 12,
    },
    label: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
      fontWeight: "500",
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.palette.neutral100,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.separator,
      paddingVertical: 12,
      paddingHorizontal: 8,
      shadowColor: colors.palette.neutral800,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    button: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.tint,
      shadowColor: colors.palette.neutral800,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    buttonDisabled: {
      backgroundColor: colors.palette.neutral300,
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.palette.neutral100,
    },
    buttonTextDisabled: {
      color: colors.palette.neutral500,
    },
    timeDisplay: {
      marginHorizontal: 24,
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.background,
      borderRadius: 12,
      minWidth: 90,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.tint,
    },
    timeDisplayFocused: {
      borderWidth: 2,
      borderColor: colors.tint,
      shadowColor: colors.tint,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    timeText: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.tint,
      letterSpacing: 1,
      textAlign: "center",
      minWidth: 50,
      padding: 0, // Remove default TextInput padding
    },
  })

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.timeContainer}>
        <TouchableOpacity
          style={[styles.button, !canDecrement && styles.buttonDisabled]}
          onPress={decrement}
          disabled={!canDecrement}
          accessibilityLabel={`Disminuir tiempo de ${label || 'selector'}`}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, !canDecrement && styles.buttonTextDisabled]}>
            −
          </Text>
        </TouchableOpacity>

        <View style={[styles.timeDisplay, isEditing && styles.timeDisplayFocused]}>
          <TextInput
            ref={inputRef}
            style={styles.timeText}
            value={isEditing ? tempValue : value}
            onChangeText={handleInputChangeText}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onSubmitEditing={handleInputSubmit}
            placeholder="HH:MM"
            keyboardType="numeric"
            maxLength={5}
            selectTextOnFocus
            accessibilityLabel={`${label || 'Tiempo'}: ${value}. Toca para editar`}
            accessibilityHint="Escribe el horario en formato HH:MM o usa los botones + y -"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !canIncrement && styles.buttonDisabled]}
          onPress={increment}
          disabled={!canIncrement}
          accessibilityLabel={`Aumentar tiempo de ${label || 'selector'}`}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, !canIncrement && styles.buttonTextDisabled]}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
