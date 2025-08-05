import React, { useState, useRef, useEffect } from "react"
import { Screen } from "../components/Screen"
import { Text } from "../components/Text"
import { TextField } from "../components/TextField"
import { Button } from "../components/Button"
import { 
  View, 
  StyleSheet, 
  Platform, 
  TouchableOpacity, 
  Modal, 
  Animated,
  Dimensions
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "@/navigators"
import { useActivities } from "@/hooks/Users"
import { ActivitiesForm } from "@/components/Custom/ActivitiesForm"
import { TimePickerForm } from "@/components/Custom/TimePickerForm"
import LocationForm from "@/components/Custom/LocationForm"
import MapView from "react-native-maps"

const { width } = Dimensions.get('window')

export function SearchScreen() {
  const { themed } = useAppTheme()
  const [modalMode, setModalMode] = useState<"selectActivity" | "selectLocation" | "selectTime" | null>(null)
  const [selectedPreferences, setSelectedPreferences] = useState<any[]>([])
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    latitude: number
    longitude: number  
  } | null>(null)
  const navigation = useNavigation<AppStackScreenProps<"Main">["navigation"]>()

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current
  const glowAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const shimmerAnim = useRef(new Animated.Value(-1)).current

  // Continuous glow animation
  useEffect(() => {
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    )

    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      })
    )

    glowAnimation.start()
    shimmerAnimation.start()

    return () => {
      glowAnimation.stop()
      shimmerAnimation.stop()
    }
  }, [])

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handlePress = () => {
    // Add a quick pulse animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    navigation.navigate("ActivityPickerScreen")
  }

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  })

  const glowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 25],
  })

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg'],
  })

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  })

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
          {/* Glow effect container */}
          <Animated.View
            style={[
              styles.glowContainer,
              {
                shadowOpacity: glowOpacity,
                shadowRadius: glowRadius,
              }
            ]}
          >
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  transform: [
                    { scale: scaleAnim },
                    { rotate: rotateInterpolate }
                  ],
                }
              ]}
            >
              <TouchableOpacity
                style={styles.searchButton}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                activeOpacity={1}
              >
                {/* Glass overlay */}
                <View style={styles.glassOverlay} />
                
                {/* Shimmer effect */}
                <Animated.View
                  style={[
                    styles.shimmer,
                    {
                      transform: [{ translateX: shimmerTranslate }],
                    }
                  ]}
                />

                {/* Content */}
                <View style={styles.buttonContent}>
                  <Text style={styles.text}>Búsqueda 🔍</Text>
                </View>

                {/* Border glow */}
                <View style={styles.borderGlow} />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
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
  glowContainer: {
    shadowColor: "#ff5c5c",
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  buttonContainer: {
    borderRadius: 35,
  },
  searchButton: {
    backgroundColor: "rgba(255, 92, 92, 0.9)",
    width: 200,
    height: 200,
    borderRadius: 500,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    // Glass effect
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    // Enhanced shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: "#ff5c5c",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 50,
    transform: [{ skewX: "-20deg" }],
  },
  buttonContent: {
    zIndex: 2,
    position: "relative",
  },
  borderGlow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    zIndex: -1,
  },
  text: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    width: "90%",
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