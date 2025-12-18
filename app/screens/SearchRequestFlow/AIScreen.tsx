"use client"

import { useState } from "react"
import { Screen, Text, Button } from "@/components"
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import type { AppStackScreenProps } from "@/navigators"
import { containers, buttons, buttonTexts, texts, inputs } from "@/theme/commonStyles"
import { AIThinkingAnimation } from "@/components/Custom/AIThinkingAnimation"
import { useStores } from "@/models"
import { Image } from "react-native"

const SUGGESTIONS = [
  {
    display: "Correr 🏃",
    prompt: "Busco gente para correr en Palermo por la mañana, algo tranqui y constante.",
  },
  {
    display: "Fútbol ⚽",
    prompt: "¿Hay algún grupo para jugar fútbol 5 hoy a la noche cerca de mi zona?",
  },
  {
    display: "Trekking 🥾",
    prompt:
      "Quiero hacer trekking el domingo, ¿hay algún grupo que vaya a la reserva o zona verde?",
  },
  {
    display: "Lectura 📚",
    prompt:
      "Quiero unirme a un grupo de lectura los fines de semana, algo relajado en plazas o cafés.",
  },
  {
    display: "Básquet 🏀",
    prompt:
      "Quiero jugar un partido de básquet esta tarde, algo informal y cerca de Palermo si es posible.",
  },
  {
    display: "Caminar 🚶‍♂️",
    prompt:
      "Busco personas para hacer caminatas suaves por la ciudad o parques, idealmente después del trabajo.",
  },
  {
    display: "Mates 🧉",
    prompt:
      "Quiero encontrar gente para tomar unos mates en una plaza tranquila y charlar un rato.",
  },
  {
    display: "Bici 🚴",
    prompt: "Quiero salir a andar en bici por la ciudad o la costanera, tranquilo pero continuo.",
  },
  {
    display: "Gimnasio 🏋️",
    prompt: "Estoy buscando un grupo para entrenar en el gimnasio o hacer rutinas al aire libre.",
  },
  {
    display: "Cine 🎬",
    prompt: "Busco personas para organizar una salida al cine este fin de semana, algo casual.",
  },
]

export function AIScreen() {
  const { themed, theme } = useAppTheme()
  const navigation = useNavigation<AppStackScreenProps<"Main">["navigation"]>()

  const [prompt, setPrompt] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { requestStore } = useStores()

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setIsThinking(true)
    setError(null)

    try {
      const delay = Math.random() * 2000 + 2000
      await new Promise((resolve) => setTimeout(resolve, delay))

      requestStore.setLocation({
        id: "1234",
        name: "Caballito, Parque Centenario",
        latitude: -34.606729,
        longitude: -58.435690,
        address: "Av. Díaz Vélez 5064, C1406 Caballito, Ciudad Autónoma de Buenos Aires",
      })
      requestStore.setRadiusKm(2)
      requestStore.setMinParticipants(3)
      requestStore.setMaxParticipants(6)
      requestStore.setSchedules([
        {
          day: "Sabado",
          timeSlots: [{ start: "13:00", end: "17:00" }],
        },
        {
          day: "Domingo",
          timeSlots: [{ start: "13:00", end: "17:00" }],
        },
      ])
      requestStore.setActivity({
        id: 36,
        name: "Paseo / Caminata",
        icon: "🚶",
      });

      navigation.navigate("RequestConfirmationScreen", { isAiGenerated: true })
    } catch (error) {
      setError("Error al procesar tu solicitud")
    } finally {
      setIsThinking(false)
    }
  }

  if (isThinking) {
    return (
      <View style={styles.thinkingSection}>
        <AIThinkingAnimation />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Screen
        preset="auto"
        contentContainerStyle={[containers.screen, styles.container]}
        backgroundColor={themed(() => theme.colors.background)}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text preset="heading" style={[themed(texts.heading), styles.title]}>
            Asistente de Búsquedas
          </Text>
          <Text style={[themed(texts.bodySmall), styles.subtitle]}>
            Contame qué tenés ganas de hacer y te ayudo a encontrar el mejor grupo
          </Text>
        </View>

        <View style={styles.inputSection}>
          {/* Prompt Input */}
          <View style={styles.inputWrapper}>
            <Text style={[themed(texts.label), styles.inputLabel]}>
              ¿Qué actividad te interesa hoy? ✨
            </Text>

            <TextInput
              style={[themed(inputs.base), themed(inputs.text), styles.promptInput]}
              placeholder="Ej: 'Me gustaría encontrar gente para hacer jugar ajedrez este domingo por la tarde en parque chacabuco'..."
              placeholderTextColor={theme.colors.textDim}
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={4}
            />

            {error ? <Text style={[themed(texts.error), { fontSize: 14 }]}>{error}</Text> : null}
          </View>

          {/* Submit Button */}
          <Button
            text="Iniciar Búsqueda 🔎"
            style={[
              themed(buttons.primary),
              styles.submitButton,
              styles.glowButton,
              !prompt.trim() && themed(buttons.primaryDisabled),
            ]}
            textStyle={[
              themed(buttonTexts.primary),
              { fontSize: 17, fontWeight: "700" },
              !prompt.trim() && themed(buttonTexts.primaryDisabled),
            ]}
            disabled={!prompt.trim()}
            onPress={handleSubmit}
          />

          {/* Suggestions */}
          <View style={styles.suggestionsSection}>
            <Text style={[themed(texts.label), styles.suggestionsTitle]}>Sugerencias rápidas</Text>

            <View style={styles.suggestionRow}>
              {SUGGESTIONS.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.chipMinimal, themed(buttons.secondary)]}
                  onPress={() => setPrompt(item.prompt)}
                >
                  <Text style={[themed(buttonTexts.secondary), styles.chipMinimalText]}>
                    {item.display}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    paddingBottom: 16,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.75,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  inputSection: {
    flex: 1,
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  promptInput: {
    borderRadius: 14,
    fontSize: 15,
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlignVertical: "top",
  },

  /** Buttons */
  submitButton: {
    borderRadius: 14,
    marginVertical: 14,
    paddingVertical: 14,
  },
  glowButton: {
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },

  /** Suggestions */
  suggestionsSection: {
    marginTop: 30,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
  suggestionChips: {
    gap: 10,
  },
  suggestionChip: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionShadow: {
    elevation: 3,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "600",
  },

  /** Thinking */
  thinkingSection: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginVertical: 60,
  },

  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chipMinimal: {
    borderRadius: 14,
    borderWidth: 1,
    opacity: 0.9,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  chipMinimalText: {
    fontSize: 14,
    fontWeight: "600",
  },
})
