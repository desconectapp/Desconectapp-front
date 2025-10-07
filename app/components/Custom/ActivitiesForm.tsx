import {
  Dimensions,
  FlatList,
  ListRenderItem,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
  Animated,
} from "react-native"
import { View } from "tamagui"
import { Text } from "../Text"
import { useActivities } from "@/hooks/Users"
import { useEffect, useState, useRef } from "react"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"

const { width } = Dimensions.get("window")

interface ActivitiesFormProps {
  selectedPreferences?: any[]
  setSelectedPreferences?: React.Dispatch<React.SetStateAction<any[]>>
  title?: string
  description?: string
}

export function ActivitiesForm({
  selectedPreferences = [],
  setSelectedPreferences = () => {},
  title,
  description,
}: ActivitiesFormProps) {
  const limit = 10
  const [allPreferences, setAllPreferences] = useState<any[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const { themed } = useAppTheme()
  const fadeAnim = useRef(new Animated.Value(1)).current
  const flatListRef = useRef<FlatList>(null)

  const { data, isLoading, isError, isFetching } = useActivities(limit, offset)
  
  // Auto-hide scroll indicator after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      hideScrollIndicator()
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])
  
  const hideScrollIndicator = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setShowScrollIndicator(false)
    })
  }

  const handleScroll = () => {
    if (showScrollIndicator) {
      hideScrollIndicator()
    }
  }
  
  useEffect(() => {
    if (isError) {
      console.error("Error loading activities")
      return
    }
    
    if (data && data.length > 0) {
      setAllPreferences((prev) => {
        // Prevent duplicate entries
        const existingIds = new Set(prev.map(item => item.id))
        const newItems = data.filter(item => !existingIds.has(item.id))
        return [...prev, ...newItems]
      })
      if (data.length < limit) {
        setHasMore(false)
      }
    } else if (data && data.length === 0) {
      setHasMore(false)
    }
  }, [data, isError])

  const loadMore = () => {
    if (!isFetching && !isLoading && hasMore && !isError) {
      setOffset((prev) => prev + limit)
    }
  }

  const renderItem: ListRenderItem<any> = ({ item }) => {
    const selected = selectedPreferences.some((p) => p.id === item.id)
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedPreferences((prev) => {
            const exists = prev.some((p) => p.id === item.id)
            if (exists) {
              return prev.filter((p) => p.id !== item.id)
            } else {
              return [...prev, item]
            }
          })
        }}
        style={[$chip, themed(selected ? $chipSelected : $chipUnselected)]}
      >
        <Text>
          {item.icon}
          {item.name}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={$contentWrapper}>
      {isError ? (
        <View style={$header}>
          <Text preset="heading" style={themed($title)}>
            Error loading activities
          </Text>
          <Text preset="subheading" style={themed($subtitle)}>
            Please check your connection and try again.
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={allPreferences}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={$listContent}
            columnWrapperStyle={$row}
            ListHeaderComponent={
              <View style={$header}>
                <Text preset="heading" style={themed($title)}>
                  {title ?? "What are you into?"}
                </Text>
                <Text preset="subheading" style={themed($subtitle)}>
                  {description ?? "Choose your interests and hobbies. You can select multiple options."}
                </Text>
              </View>
            }
            ListFooterComponent={
              <View style={$footer}>
                <Text style={themed($selectedCount)}>{selectedPreferences.length} selected</Text>
                {isFetching && <Text style={themed($selectedCount)}>Loading more...</Text>}
                {isLoading && allPreferences.length === 0 && (
                  <Text style={themed($selectedCount)}>Loading activities...</Text>
                )}
              </View>
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.6}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
          
          {/* Scroll Indicator */}
          {showScrollIndicator && allPreferences.length > 4 && (
            <Animated.View style={[themed($scrollIndicator), { opacity: fadeAnim }]}>
              <Text style={themed($scrollIndicatorText)}>⬇️ Desliza para ver más</Text>
            </Animated.View>
          )}
        </>
      )}
    </View>
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

const $scrollIndicator = (theme: any): ViewStyle => ({
  position: "absolute",
  bottom: spacing.xl,
  right: spacing.lg,
  backgroundColor: theme.colors.tint,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: spacing.md,
  shadowColor: theme.colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
})

const $scrollIndicatorText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontSize: 14,
  fontWeight: "600",
})
