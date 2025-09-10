import React, { useState, useRef } from "react"
import {
  View,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native"
import { PanGestureHandler, State } from "react-native-gesture-handler"
import { Text, Button } from "../"
import { useAppTheme } from "@/utils/useAppTheme"
import { containers, buttons, buttonTexts, texts } from "@/theme/commonStyles"

interface CustomSliderProps {
  value: number
  min: number
  max: number
  step?: number
  label: string
  onValueChange: (value: number) => void
  formatValue?: (value: number) => string
  showButtons?: boolean
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  min,
  max,
  step = 1,
  label,
  onValueChange,
  formatValue = (val) => `${val}`,
  showButtons = false,
}) => {
  const { themed } = useAppTheme()
  const [isDragging, setIsDragging] = useState(false)
  const panRef = useRef<any>()

  const trackWidth = 280
  const range = max - min
  const percentage = (value - min) / range

  // Handler para el pan gesture del slider
  const onPanGestureEvent = (event: any) => {
    const { absoluteX } = event.nativeEvent
    // Obtener la posición X del track relativo a la pantalla
    const trackStartX = 60 // Posición aproximada donde empieza el track
    const relativeX = absoluteX - trackStartX
    const newPercentage = Math.max(0, Math.min(1, relativeX / trackWidth))
    const rawValue = min + newPercentage * range
    const newValue = Math.round(rawValue / step) * step
    
    if (newValue !== value && newValue >= min && newValue <= max) {
      onValueChange(newValue)
    }
  }

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsDragging(true)
    } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      setIsDragging(false)
    }
  }

  const handleTrackPress = (event: any) => {
    const { locationX } = event.nativeEvent
    const newPercentage = Math.max(0, Math.min(1, locationX / trackWidth))
    const rawValue = min + newPercentage * range
    const newValue = Math.round(rawValue / step) * step
    onValueChange(Math.max(min, Math.min(max, newValue)))
  }

  const increment = () => {
    const newValue = Math.min(max, value + step)
    onValueChange(newValue)
  }

  const decrement = () => {
    const newValue = Math.max(min, value - step)
    onValueChange(newValue)
  }


  return (
    <View style={[themed(containers.section), themed($container)]}>
      <Text style={themed(texts.label)}>{label}: {formatValue(value)}</Text>      

      {/* Slider */}
      <View style={themed($sliderContainer)}>
        <TouchableOpacity
          style={themed($sliderTrack)}
          onPress={handleTrackPress}
          activeOpacity={1}
        >
          <View 
            style={[
              themed($sliderProgress), 
              { width: `${percentage * 100}%` }
            ]} 
          />
          
          {/* Slider thumb con pan gesture */}
          <PanGestureHandler
            ref={panRef}
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanHandlerStateChange}
          >
            <View
              style={[
                themed($sliderThumb),
                { left: `${percentage * 100}%` },
                isDragging && themed($sliderThumbActive)
              ]}
            />
          </PanGestureHandler>
        </TouchableOpacity>
        
        {/* Botones de incremento/decremento */}
        {showButtons && (
          <View style={themed($sliderButtons)}>
            <TouchableOpacity
              style={[themed(buttons.secondary), themed($sliderButton)]}
              onPress={decrement}
            >
              <Text style={themed(buttonTexts.secondary)}>-</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[themed(buttons.secondary), themed($sliderButton)]}
              onPress={increment}
            >
              <Text style={themed(buttonTexts.secondary)}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

// Styles
const $container = (theme: any): ViewStyle => ({
  marginBottom: theme.spacing.sm,
})

const $sliderContainer = (theme: any): ViewStyle => ({
  marginTop: theme.spacing.xs,
})

const $sliderTrack = (theme: any): ViewStyle => ({
  height: 6,
  backgroundColor: theme.colors.backgroundMuted,
  borderRadius: 3,
  position: "relative",
  marginVertical: theme.spacing.xs,
})

const $sliderProgress = (theme: any): ViewStyle => ({
  height: "100%",
  backgroundColor: theme.colors.tint,
  borderRadius: 3,
})

const $sliderThumb = (theme: any): ViewStyle => ({
  position: "absolute",
  top: -6,
  width: 18,
  height: 18,
  backgroundColor: theme.colors.tint,
  borderRadius: 9,
  marginLeft: -9, // Center the thumb
})

const $sliderThumbActive = (theme: any): ViewStyle => ({
  width: 22,
  height: 22,
  top: -8,
  marginLeft: -11,
  shadowColor: theme.colors.tint,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
})

const $sliderButtons = (theme: any): ViewStyle => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: theme.spacing.xs,
})

const $sliderButton = (theme: any): ViewStyle => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  minHeight: 40,
  paddingHorizontal: 0,
  paddingVertical: 0,
})
