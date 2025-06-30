import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native"
import { useStores } from "app/models"

const { width } = Dimensions.get("window")

interface Preference {
  id: string
  label: string
  emoji: string
}

const preferences: Preference[] = [
  { id: "soccer", label: "Soccer", emoji: "⚽" },
  { id: "basketball", label: "Basketball", emoji: "🏀" },
  { id: "tennis", label: "Tennis", emoji: "🎾" },
  { id: "swimming", label: "Swimming", emoji: "🏊" },
  { id: "running", label: "Running", emoji: "🏃" },
  { id: "cycling", label: "Cycling", emoji: "🚴" },
  { id: "yoga", label: "Yoga", emoji: "🧘" },
  { id: "hiking", label: "Hiking", emoji: "🥾" },
  { id: "dancing", label: "Dancing", emoji: "💃" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "reading", label: "Reading", emoji: "📚" },
  { id: "cooking", label: "Cooking", emoji: "👨‍🍳" },
  { id: "photography", label: "Photography", emoji: "📸" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "art", label: "Art", emoji: "🎨" },
]

export const PreferencesScreen = () => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])
  const { signUpStore } = useStores()

  const togglePreference = (preferenceId: string) => {
    setSelectedPreferences((prev) => {
      if (prev.includes(preferenceId)) {
        return prev.filter((id) => id !== preferenceId)
      } else {
        return [...prev, preferenceId]
      }
    })
  }

  const handleContinue = () => {
    signUpStore.setPreferences(selectedPreferences)
  }

  const renderPreferenceChip = (preference: Preference) => {
    const isSelected = selectedPreferences.includes(preference.id)

    return (
      <TouchableOpacity
        key={preference.id}
        style={[styles.chip, isSelected && styles.chipSelected]}
        onPress={() => togglePreference(preference.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.emoji}>{preference.emoji}</Text>
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
          {preference.label}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>What are you into?</Text>
          <Text style={styles.subtitle}>
            Choose your interests and hobbies. You can select multiple options.
          </Text>
        </View>

        <View style={styles.chipsContainer}>{preferences.map(renderPreferenceChip)}</View>

        <View style={styles.footer}>
          <Text style={styles.selectedCount}>{selectedPreferences.length} selected</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedPreferences.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedPreferences.length === 0}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.continueButtonText,
              selectedPreferences.length === 0 && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  bottomContainer: {
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E5E5E5",
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  chip: {
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderColor: "transparent",
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: "center",
    marginBottom: 12,
    maxWidth: (width - 60) / 2,
    minWidth: (width - 60) / 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chipSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#0056CC",
  },
  chipText: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 0,
    padding: 0,
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    marginTop: 25,
  },
  continueButton: {
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    justifyContent: "center",
    paddingVertical: 16,
  },
  continueButtonDisabled: {
    backgroundColor: "#E5E5E5",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  continueButtonTextDisabled: {
    color: "#999999",
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  selectedCount: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "500",
  },
  subtitle: {
    color: "#666666",
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  title: {
    color: "#1A1A1A",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
})
