import { observer } from "mobx-react-lite"
import { useState } from "react"
import { View, ScrollView, TouchableOpacity, Dimensions, ViewStyle, TextStyle } from "react-native"
import { Text, Button } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { spacing } from "@/theme"
import { useStores } from "@/models"
import { usePreferences, useProfile } from "@/hooks/Users"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "@/navigators"
import { useAppToast } from "@/components/useToast"

const { width } = Dimensions.get("window")

export const PreferencesScreen = observer(() => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])
  const { signUpStore } = useStores()
  const { themed } = useAppTheme()
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()
  const { showToast } = useAppToast()

  const { data: preferences, isLoading, isError } = usePreferences()
  const { mutateAsync: profileMutateAsync } = useProfile()

  const togglePreference = (id: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  const handleContinue = () => {
    profileMutateAsync(
      {
        ...signUpStore.userInfo,
        preferences: selectedPreferences,
      },
      {
        onSuccess: (response) => {
          console.log("Profile updated successfully:", response)
          signUpStore.setPreferences(selectedPreferences)
          navigation.navigate("Welcome")
        },
        onError: (error) => {
          console.error("Error updating profile:", error)
          showToast("Creation Failed")
        },
      },
    )
  }

  return (
    <View style={$contentWrapper}>
      <ScrollView
        style={$scroll}
        contentContainerStyle={$scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={$header}>
          <Text preset="heading" style={themed($title)}>
            What are you into?
          </Text>
          <Text preset="subheading" style={themed($subtitle)}>
            Choose your interests and hobbies. You can select multiple options.
          </Text>
        </View>

        <View style={$chipsContainer}>
          {isError && <Text style={themed($subtitle)}>Error loading preferences</Text>}
          {isLoading && "Loading preferences..."}
          {preferences &&
            preferences.length > 0 &&
            preferences.map((pref) => {
              const selected = selectedPreferences.includes(pref.id)
              return (
                <TouchableOpacity
                  key={pref.id}
                  onPress={() => togglePreference(pref.id)}
                  style={[$chip, themed(selected ? $chipSelected : $chipUnselected)]}
                >
                  <Text style={$emoji}>{pref.icon}</Text>
                  <Text style={themed(selected ? $chipTextSelected : $chipTextUnselected)}>
                    {pref.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
        </View>

        <View style={$footer}>
          <Text style={themed($selectedCount)}>{selectedPreferences.length} selected</Text>
        </View>
      </ScrollView>

      <View style={[$bottomBar, $bottomInsets]}>
        <Button
          text="Continue"
          onPress={handleContinue}
          disabled={selectedPreferences.length === 0}
          style={[
            themed($continueButton),
            selectedPreferences.length === 0 && themed($continueButtonDisabled),
          ]}
          textStyle={themed(
            selectedPreferences.length === 0 ? $continueButtonTextDisabled : $continueButtonText,
          )}
        />
      </View>
    </View>
  )
})

const $contentWrapper: ViewStyle = {
  flex: 1,
}

const $scroll: ViewStyle = {
  flex: 1,
}

const $scrollContent: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxl,
}

const $header: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.lg,
}

const $title = (theme: any): TextStyle => ({
  color: theme.colors.text,
  fontSize: 28,
  fontWeight: "bold",
  marginBottom: spacing.sm,
  textAlign: "center",
})

const $subtitle = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  textAlign: "center",
  fontSize: 16,
  lineHeight: 22,
})

const $chipsContainer: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginBottom: spacing.lg,
}

const $chip: ViewStyle = {
  borderRadius: 25,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  marginBottom: spacing.md,
  width: (width - spacing.lg * 3) / 2,
  alignItems: "center",
}

const $chipSelected = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  borderColor: theme.colors.tint,
  borderWidth: 2,
})

const $chipUnselected = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.backgroundMuted,
  borderColor: theme.colors.border,
  borderWidth: 2,
})

const $chipTextSelected = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontWeight: "600",
})

const $chipTextUnselected = (theme: any): TextStyle => ({
  color: theme.colors.text,
  fontWeight: "600",
})

const $emoji: TextStyle = {
  fontSize: 26,
  lineHeight: 32,
  marginBottom: 4,
}

const $footer: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.lg,
}

const $selectedCount = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  fontSize: 14,
  fontWeight: "500",
})

const $bottomBar: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
}

const $continueButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  borderRadius: spacing.md,
  minHeight: 56,
  justifyContent: "center",
})

const $continueButtonDisabled = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.backgroundMuted,
})

const $continueButtonText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontWeight: "600",
  fontSize: 16,
})

const $continueButtonTextDisabled = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  fontSize: 16,
  fontWeight: "600",
})
