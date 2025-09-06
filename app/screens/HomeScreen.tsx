import { observer } from "mobx-react-lite"
import { useState, useCallback } from "react"
import {
  View,
  type ViewStyle,
  type TextStyle,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native"
import { Screen, Text } from "@/components"
import type { AppStackScreenProps } from "../navigators"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { PhotoGallerySlider, type PhotoItem } from "@/components/Custom/PhotoGallerySlider"
import { useGroups } from "@/hooks/Groups"
import { spacing } from "@/theme"

const { width } = Dimensions.get("window")

interface Group {
  id: string
  name: string
  lastMessage?: string
  icon?: string
  memberCount?: number
  activity?: string
  unreadCount?: number
}

const mockSuggestions: PhotoItem[] = [
  {
    id: "1",
    image:
      "https://diariohoynet.nyc3.cdn.digitaloceanspaces.com/adjuntos/galerias/000/338/0000338803.jpg",
    title: "Caminata al Atardecer",
    subtitle: "Palermo, Buenos Aires",
  },
  {
    id: "2",
    image:
      "https://www.hoysejuega.com/uploads/Modules/ImagenesComplejos/800_600_futbol-point-1.png",
    title: "Futbol 5",
    subtitle: "Recoleta, Buenos Aires",
  },
  {
    id: "3",
    image:
      "https://www.conasi.eu/blog/wp-content/uploads/2020/09/ceramica-y-porcelana-para-cocinar-1111-1.jpg",
    title: "Ceramica",
    subtitle: "Plaza Francia, Recoleta",
  },
  {
    id: "4",
    image:
      "https://www.hoysejuega.com/uploads/Modules/ImagenesComplejos/800_600_futbol-point-1.png",
    title: "Tarde de Mate",
    subtitle: "Costanera Sur",
  },
  {
    id: "5",
    image:
      "https://www.hoysejuega.com/uploads/Modules/ImagenesComplejos/800_600_futbol-point-1.png",
    title: "Clases de Tango",
    subtitle: "San Telmo",
  },
  {
    id: "6",
    image:
      "https://www.hoysejuega.com/uploads/Modules/ImagenesComplejos/800_600_futbol-point-1.png",
    title: "Picnic en el Parque",
    subtitle: "Bosques de Palermo",
  },
]

const loadingGroups = Array.from({ length: 3 }, (_, i) => ({
  id: `${i}`,
  name: "",
  icon: "⌛️",
}))

export const HomeScreen = observer(function HomeScreen() {
  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const navigation = useNavigation<AppStackScreenProps<"HomeScreen">["navigation"]>()
  const { data: groups, isLoading, refetch } = useGroups()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  const renderGroupCard = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={themed($groupCard)}
      onPress={() => navigation.navigate("GroupScreen", { groupId: item.id })}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <View style={$groupCardContent}>
        <View style={themed($groupAvatar)}>
          <Text style={themed($groupAvatarText)}>
            {item.icon || item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={$groupInfo}>
          <View style={$groupHeader}>
            <Text style={themed($groupName)} numberOfLines={1}>
              {item.name}
            </Text>
            {item.unreadCount && item.unreadCount > 0 && (
              <View style={themed($unreadBadge)}>
                <Text style={themed($unreadText)}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>

          <Text style={themed($lastMessage)} numberOfLines={1}>
            {!isLoading ? item.lastMessage || "No messages yet" : ""}
          </Text>

          {item.memberCount && <Text style={themed($memberCount)}>{item.memberCount} members</Text>}
        </View>

        <View style={themed($groupArrow)}>
          <Text style={themed($arrowText)}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderGroupsSection = () => {
    if (!isLoading && !groups?.length) {
      return (
        <View style={$emptyContainer}>
          <Text style={$emptyIcon}>👥</Text>
          <Text style={themed($emptyTitle)}>No Groups Yet</Text>
          <Text style={themed($emptySubtitle)}>Make your first search!</Text>
        </View>
      )
    }

    const limitedGroups = groups ? groups.slice(0, 3) : []

    return (
      <View style={$groupsSection}>
        <View style={$sectionHeader}>
          <Text style={themed($sectionTitle)}>My Groups</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={themed($seeAllText)}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={isLoading ? loadingGroups : limitedGroups}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={$groupsList}
          scrollEnabled={false}
        />
      </View>
    )
  }

  return (
    <View style={themed($screenBackground)}>
      <FlatList
        data={[{ key: "content" }]}
        renderItem={() => (
          <View style={[$container, $topInsets]}>
            <View style={$header}>
              <View style={$headerContent}>
                <Text style={themed($greetingText)}>DesconectApp</Text>
                <Text style={themed($welcomeText)}>Ready to connect?</Text>
              </View>

              <TouchableOpacity style={themed($profileButton)} activeOpacity={0.8}>
                <View style={themed($profileAvatar)}>
                  <Text style={themed($profileAvatarText)}>U</Text>
                </View>
              </TouchableOpacity>
            </View>

            {renderGroupsSection()}

            <View style={$suggestionsSection}>
              <PhotoGallerySlider
                onItemPress={(item) => {
                  navigation.navigate("SuggestionScreen", { suggestionId: item.id })
                }}
                data={mockSuggestions}
                title="Discover New Groups"
                itemWidth={width * 0.42}
              />
            </View>
          </View>
        )}
        keyExtractor={(item) => item.key}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.tint}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
}

const $screenBackground = (theme: any) => ({
  backgroundColor: theme.colors.background,
})

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xl,
  paddingTop: spacing.md,
}

const $headerContent: ViewStyle = {
  flex: 1,
}

const $greetingText = (theme: any): TextStyle => ({
  fontSize: 28,
  lineHeight: 34,
  fontWeight: "bold",
  color: theme.colors.text,
  marginBottom: spacing.xs,
})

const $welcomeText = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.textDim,
})

const $profileButton = (theme: any): ViewStyle => ({
  shadowColor: theme.colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $profileAvatar = (theme: any): ViewStyle => ({
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: theme.colors.tint,
  justifyContent: "center",
  alignItems: "center",
})

const $profileAvatarText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontSize: 18,
  fontWeight: "600",
})

const $groupsSection: ViewStyle = {
  marginBottom: spacing.xl,
}

const $sectionHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.lg,
}

const $sectionTitle = (theme: any): TextStyle => ({
  fontSize: 22,
  fontWeight: "700",
  color: theme.colors.text,
})

const $seeAllText = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.tint,
  fontWeight: "600",
})

const $groupsList: ViewStyle = {
  gap: spacing.md,
}

const $groupCard = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.palette.neutral100,
  borderRadius: spacing.sm,
  padding: spacing.sm,
  margin: spacing.xxs,
  shadowColor: theme.colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
  borderWidth: 1,
  borderColor: theme.colors.border,
})

const $groupCardContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $groupAvatar = (theme: any): ViewStyle => ({
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: theme.colors.tint,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.md,
})

const $groupAvatarText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontSize: 20,
  fontWeight: "600",
})

const $groupInfo: ViewStyle = {
  flex: 1,
}

const $groupHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.xs,
}

const $groupName = (theme: any): TextStyle => ({
  fontSize: 18,
  fontWeight: "600",
  color: theme.colors.text,
  flex: 1,
})

const $unreadBadge = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.error,
  borderRadius: 12,
  minWidth: 24,
  height: 24,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.xs,
})

const $unreadText = (theme: any): TextStyle => ({
  color: "#ffffff",
  fontSize: 12,
  fontWeight: "600",
})

const $lastMessage = (theme: any): TextStyle => ({
  fontSize: 14,
  color: theme.colors.textDim,
  marginBottom: spacing.xs,
})

const $memberCount = (theme: any): TextStyle => ({
  fontSize: 12,
  color: theme.colors.textDim,
  fontWeight: "500",
})

const $groupArrow = (theme: any): ViewStyle => ({
  marginLeft: spacing.sm,
})

const $arrowText = (theme: any): TextStyle => ({
  fontSize: 24,
  color: theme.colors.textDim,
  fontWeight: "300",
})

const $loadingContainer: ViewStyle = {
  alignItems: "center",
  paddingVertical: spacing.xxl,
}

const $loadingText = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.textDim,
  marginTop: spacing.md,
})

const $emptyContainer: ViewStyle = {
  alignItems: "center",
  paddingVertical: spacing.xxl,
}

const $emptyIcon: TextStyle = {
  fontSize: 64,
  lineHeight: 64,
  marginBottom: spacing.lg,
}

const $emptyTitle = (theme: any): TextStyle => ({
  fontSize: 20,
  fontWeight: "600",
  color: theme.colors.text,
  marginBottom: spacing.sm,
})

const $emptySubtitle = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.textDim,
  textAlign: "center",
  paddingHorizontal: spacing.lg,
})

const $suggestionsSection: ViewStyle = {}
