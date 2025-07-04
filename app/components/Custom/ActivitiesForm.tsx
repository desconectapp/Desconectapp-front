import {
  Dimensions,
  FlatList,
  ListRenderItem,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native"
import { View } from "tamagui"
import { Text } from "../Text"
import { useActivities } from "@/hooks/Users"
import { useEffect, useState } from "react"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"

const { width } = Dimensions.get("window")

interface ActivitiesFormProps {
  selectedPreferences?: any[]
  setSelectedPreferences?: React.Dispatch<React.SetStateAction<any[]>>
}

export function ActivitiesForm({
  selectedPreferences = [],
  setSelectedPreferences = () => {},
}: ActivitiesFormProps) {
  const limit = 10
  const [allPreferences, setAllPreferences] = useState<any[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const { themed } = useAppTheme()

  const { data, isLoading, isError, isFetching } = useActivities(limit, offset)
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


  const loadMore = () => {
    if (!isFetching && !isLoading && hasMore) {
      setOffset((prev) => prev + limit)
    }
  }

  const renderItem: ListRenderItem<any> = ({ item }) => {
    const selected = selectedPreferences.some((p) => p.id === item.id)
    return (
      <TouchableOpacity
        onPress={() => 
       {
        setSelectedPreferences((prev) => {
      const exists = prev.some((p) => p.id === item.id)
      if (exists) {
        return prev.filter((p) => p.id !== item.id)
      } else {
        return [...prev, item]
      }
    })}


        }
        style={[$chip, themed(selected ? $chipSelected : $chipUnselected)]}
      >
        <Text>{(item.emoji)}{item.name}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      data={allPreferences}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
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
  )
}

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
  minWidth: 100,
  flex: 1,
  maxWidth: "48%",
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
