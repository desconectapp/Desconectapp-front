import { observer } from "mobx-react-lite"
import { useEffect, useState } from "react"
import {
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ViewStyle,
  TextStyle,
  ListRenderItem,
} from "react-native"
import { Text, Button } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { spacing } from "@/theme"
import { useStores } from "@/models"
import { useEditProfile, useActivities, useAddPreferences } from "@/hooks/Users"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "@/navigators"
import { ActivitiesForm } from "@/components/Custom/ActivitiesForm"

const { width } = Dimensions.get("window")

export const PreferencesScreen = observer(() => {
  {
    /* TODO: esto esta masomenos pasado a ActivitiesForm para reutilizar */
  }

  const [selectedPreferences, setSelectedPreferences] = useState<number[]>([])
  const [allPreferences, setAllPreferences] = useState<any[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const limit = 10
  const { signUpStore } = useStores()
  const { themed } = useAppTheme()
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const navigation = useNavigation<AppStackScreenProps<"Main">["navigation"]>()

  const { data, isLoading, isError, isFetching } = useActivities(limit, offset)
  const addPreferences = useAddPreferences()

  useEffect(() => {
    if (data && data.length > 0) {
      setAllPreferences((prev) => [...prev, ...data])
      if (data.length < limit) {
        setHasMore(false)
      }
    } else if (data && data.length === 0) {
      setHasMore(false)
    }
  }, [data])

  const togglePreference = (id: number) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  const handleContinue = async () => {
    await addPreferences.mutateAsync(selectedPreferences, {
      onSuccess: () => {
        // signUpStore.setPreferences(selectedPreferences)
        navigation.navigate("Main", { screen: "Tabs" })
      },
      onError: (error) => {
        console.error("Error updating profile:", error)
        navigation.navigate("Main", { screen: "Tabs" })
      },
    })
  }

  const loadMore = () => {
    if (!isFetching && !isLoading && hasMore) {
      setOffset((prev) => prev + limit)
    }
  }

  const renderItem: ListRenderItem<any> = ({ item }) => {
    const selected = selectedPreferences.includes(item.id)
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => togglePreference(item.id)}
        style={[$chip, themed(selected ? $chipSelected : $chipUnselected)]}
      >
        <Text style={$emoji}>{item.icon}</Text>
        <Text style={themed(selected ? $chipTextSelected : $chipTextUnselected)}>{item.name}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={$contentWrapper}>
      <FlatList
        data={allPreferences}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={$listContent}
        columnWrapperStyle={$row}
        ListHeaderComponent={
          <View style={$header}>
            <Text preset="heading" style={themed($title)}>
              What are you into?
            </Text>
            <Text preset="subheading" style={themed($subtitle)}>
              Choose your interests and hobbies. You can select multiple options.
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={$footer}>
            <Text style={themed($selectedCount)}>{selectedPreferences.length} selected</Text>
            {isFetching && <Text style={themed($selectedCount)}>Loading more...</Text>}
          </View>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
      />
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

const $listContent: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxl,
}

const $row: ViewStyle = {
  justifyContent: "space-between",
  marginBottom: spacing.md,
}
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
