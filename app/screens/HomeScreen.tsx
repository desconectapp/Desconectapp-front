import { observer } from "mobx-react-lite"
import { useState, useEffect, useCallback } from "react"
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
import { GroupFront } from "./GroupsFront.types"
import { Group } from "@/services/groups/Groups.types"



const { width } = Dimensions.get("window")


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

export const HomeScreen = observer(function HomeScreen() {
  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const navigation = useNavigation<AppStackScreenProps<"HomeScreen">["navigation"]>()
  const { data: paginatedGroups, isLoading, refetch } = useGroups()
  const [refreshing, setRefreshing] = useState(false)
  const [allGroups, setAllGroups] = useState<Group[]>([])

  useEffect(() => {
    if (paginatedGroups?.groups) {
      setAllGroups(paginatedGroups.groups)
    }
  }, [paginatedGroups])

  console.log("Paginated Groups:", paginatedGroups)
  console.log("All Groups State:", allGroups)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  const loadMoreGroups = useCallback(() => {
    if (paginatedGroups?.has_more && !isLoading) {
      refetch() // assumes your hook handles pagination internally
    }
  }, [paginatedGroups, isLoading, refetch])

  const renderGroupCard = ({ item }: { item: GroupFront }) => (
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
    if (isLoading && allGroups.length === 0) {
      return <Text>Loading groups...</Text>
    }

    if (!isLoading && allGroups.length === 0) {
      return (
        <View style={$emptyContainer}>
          <Text style={$emptyIcon}>👥</Text>
          <Text style={themed($emptyTitle)}>No Groups Yet</Text>
          <Text style={themed($emptySubtitle)}>Make your first search!</Text>
        </View>
      )
    }

    const limitedGroups = allGroups.slice(0, 3) // show only first 3

    return (
      <View style={$groupsSection}>
        <View style={$sectionHeader}>
          <Text style={themed($sectionTitle)}>My Groups</Text>
          {allGroups.length > 3 && ( // show See All only if there are more
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("MyGroupsScreen")}
            >
              <Text style={themed($seeAllText)}>See All</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={limitedGroups}
          renderItem={renderGroupCard}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={$groupsList}
          scrollEnabled={false} // fixed, no scrolling for just 3 items
        />
      </View>
    )
  }


  return (
    <FlatList
      data={[{ key: "content" }]}
      renderItem={() => (
        <View style={[$container, $topInsets]}>
          {/* Header */}
          <View style={$header}>{/* ... header content ... */}</View>

          {/* Groups */}
          {renderGroupsSection()}

          {/* Suggestions */}
          <View style={$suggestionsSection}>
            <PhotoGallerySlider
              onItemPress={(item) =>
                navigation.navigate("SuggestionScreen", { suggestionId: item.id })
              }
              data={mockSuggestions}
              title="Discover New Groups"
              itemWidth={width * 0.42}
            />
          </View>
        </View>
      )}
      keyExtractor={(item) => item.key}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.tint} />
      }
      onEndReached={loadMoreGroups}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
    />
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