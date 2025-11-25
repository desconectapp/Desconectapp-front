"use client"

import React, { useEffect } from "react"
import { View, StyleSheet, Animated, Text } from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"
import { Image } from "react-native"

const AnimatedText = Animated.createAnimatedComponent(Text)

export function AIThinkingAnimation() {
  const { themed, theme } = useAppTheme()

  const dot1Opacity = React.useRef(new Animated.Value(0.3)).current
  const dot2Opacity = React.useRef(new Animated.Value(0.3)).current
  const dot3Opacity = React.useRef(new Animated.Value(0.3)).current
  const scaleValue = React.useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Pulse animation for dots
    const dotAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1Opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dot1Opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    )

    const dot2Animation = Animated.loop(
      Animated.sequence([
        Animated.delay(200),
        Animated.sequence([
          Animated.timing(dot2Opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),
    )

    const dot3Animation = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.sequence([
          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),
    )

    // Scale pulse
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    )

    dotAnimation.start()
    dot2Animation.start()
    dot3Animation.start()
    scaleAnimation.start()

    return () => {
      dotAnimation.stop()
      dot2Animation.stop()
      dot3Animation.stop()
      scaleAnimation.stop()
    }
  }, [dot1Opacity, dot2Opacity, dot3Opacity, scaleValue])

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/ai_loader.gif")}
        style={{ width: 125, height: 125, marginBottom: 20 }}
      />
      {/* Thinking Text */}
      <View style={styles.textContainer}>
        <View style={styles.dotsContainer}>
          <Text style={[themed({ color: theme.colors.text }), styles.thinkingText]}>
          El asistente está pensando 
          </Text>
          <Animated.Text
            style={[
              styles.dot,
              {
                opacity: dot1Opacity,
              },
            ]}
          >
            •
          </Animated.Text>
          <Animated.Text
            style={[
              styles.dot,
              {
                opacity: dot2Opacity,
              },
            ]}
          >
            •
          </Animated.Text>
          <Animated.Text
            style={[
              styles.dot,
              {
                opacity: dot3Opacity,
              },
            ]}
          >
            •
          </Animated.Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  brainContainer: {
    marginBottom: 24,
  },
  brainIcon: {
    fontSize: 80,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  dot: {
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 2,
  },
  dotsContainer: {
    flexDirection: "row",
    height: 24,
    justifyContent: "center",
    marginLeft: 8,
  },
  particle: {
    fontSize: 20,
  },
  particleIcon: {
    fontSize: 24,
  },
  particlesContainer: {
    alignItems: "center",
    height: 200,
    justifyContent: "space-around",
    position: "absolute",
    width: 120,
  },
  textContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 24,
  },
  thinkingText: {
    fontSize: 18,
    fontWeight: "600",
  },
})
