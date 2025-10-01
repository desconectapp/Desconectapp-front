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
import { useGroups, useGroupsRecs } from "@/hooks/Groups"
import { spacing } from "@/theme"
import { GroupFront } from "./GroupsFront.types"
import { Group, OpenGroup } from "@/services/groups/Groups.types"


const { width } = Dimensions.get("window")


export const HomeScreen = observer(function HomeScreen() {
  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const navigation = useNavigation<AppStackScreenProps<"HomeScreen">["navigation"]>()

  // Hooks for My Groups
  const { data: paginatedGroups, isLoading, refetch } = useGroups()
  const [refreshing, setRefreshing] = useState(false)
  const [allGroups, setAllGroups] = useState<Group[]>([])

  // Hooks for Recommended Groups
  const { data: recommendedGroups, isLoading: isLoadingRecs, refetch: refetchRecs } = useGroupsRecs(0)
  const [refreshingRecs, setRefreshingRecs] = useState(false)

  console.log("Recommended Groups:", recommendedGroups)

  // Use a single refresh handler for both hooks
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setRefreshingRecs(true)
    try {
      await Promise.all([refetch(), refetchRecs()])
    } finally {
      setRefreshing(false)
      setRefreshingRecs(false)
    }
  }, [refetch, refetchRecs])

  useEffect(() => {
    if (paginatedGroups?.groups) {
      setAllGroups(paginatedGroups.groups)
    }
  }, [paginatedGroups])


  const recommendedPhotoItems: PhotoItem[] = recommendedGroups?.groups?.map((group: OpenGroup) => ({
    id: String(group.id),
    title: group.name,
    subtitle: group.activity_name,
    image: group.photo,
  })) || []

  const renderGroupCard = ({ item }: { item: GroupFront }) => (
    <TouchableOpacity
      style={themed($groupCardContainer)}
      onPress={() => navigation.navigate("GroupScreen", { groupId: item.id })}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <View style={$groupCardInner}>
        {/* Avatar */}
        <View style={themed($groupAvatar)}>
          <Text style={themed($groupAvatarText)}>
            {item.icon || item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Group Info */}
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

          <Text style={themed($description)} numberOfLines={1}>
            {!isLoading ? item.description || "No description yet" : ""}
          </Text>

          {item.memberCount && (
            <Text style={themed($memberCount)}>
              {item.memberCount} members
            </Text>
          )}
        </View>

        {/* Arrow */}
        <View style={$groupArrow}>
          <Text style={themed($arrowText)}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
  
  const ListHeaderComponent = () => {
    const myGroupsSection = () => {
      if (isLoading && allGroups.length === 0) {
        return <Text style={themed($loadingText)}>Loading groups...</Text>
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
  
      const limitedGroups = allGroups.slice(0, 3)
  
      return (
        <View style={$groupsSection}>
          <View style={$sectionHeader}>
            <Text style={themed($sectionTitle)}>My Groups</Text>
            {allGroups.length > 3 && (
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

  const discoverNewGroupsSection = () => {
    return (
      <View style={$suggestionsSection}>
        <View style={$sectionHeader}>
          <Text style={themed($sectionTitle)}>Discover New Groups</Text>
        </View>

        {/* Content depending on state */}
        {isLoadingRecs ? (
          <ActivityIndicator style={$loadingIndicator} size="large" color={theme.colors.tint} />
        ) : recommendedPhotoItems.length === 0 ? (
          <View style={$centeredInfo}>
            <Text style={themed($mutedInfoText)}>
              No new groups to recommend right now 👀
            </Text>
          </View>
        ) : (
          <PhotoGallerySlider
            onItemPress={(item) => {
              const selectedGroup = recommendedGroups?.groups.find(
                (g) => String(g.id) === item.id
              )

              if (selectedGroup) {
                navigation.navigate("SuggestionScreen", { group: selectedGroup })
              }
            }}
            data={recommendedPhotoItems}
            itemWidth={width * 0.42}
          />
        )}
      </View>
    )
  }

    return (
      <View style={[$container, $topInsets]}>
        {/* Header */}
        <View style={$header}>{/* ... header content ... */}</View>
        {/* My Groups Section */}
        {myGroupsSection()}
        {/* Discover New Groups Section */}
        {discoverNewGroupsSection()}
      </View>
    )
  }

  return (
    <Screen
      preset="fixed"
      style={$screenStyle}
      contentContainerStyle={$screenContent}
      backgroundColor={theme.colors.background}
      safeAreaEdges={["top"]}
    >
      <FlatList
        style={$listStyle}
        data={[{ key: "content" }]}
        renderItem={() => null}
        keyExtractor={(item) => item.key}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || refreshingRecs}
            onRefresh={onRefresh}
            tintColor={theme.colors.tint}
          />
        }
        onEndReached={() => null}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={
          isLoadingRecs ? (
            <ActivityIndicator style={$loadingIndicator} size="large" color={theme.colors.tint} />
          ) : null
        }
      />
    </Screen>
  )
})



const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
}

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

const $suggestionsSection: ViewStyle = {
  marginBottom: spacing.xl,
}

const $loadingIndicator: ViewStyle = {
  marginVertical: spacing.lg,
}

const $screenStyle: ViewStyle = { flex: 1 }
const $screenContent: ViewStyle = { flex: 1 }
const $listStyle: ViewStyle = { flex: 1 }

const $loadingText = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.text,
})

const $centeredInfo: ViewStyle = {
  alignItems: "center",
  paddingVertical: spacing.lg,
}

const $mutedInfoText = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.textDim,
  textAlign: "center",
})

const $groupCardContainer = (theme: any): ViewStyle => ({
  marginVertical: spacing.xs / 2,
  marginHorizontal: 0,
  borderRadius: spacing.lg,
  overflow: "hidden",
  backgroundColor: theme.colors.background,
  borderWidth: 1,
  borderColor: theme.colors.border,
  shadowColor: theme.colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
})

const $groupCardInner: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.sm,
}

const $groupAvatar = (theme: any): ViewStyle => ({
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: theme.colors.backgroundMuted,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.sm,
})

const $groupAvatarText = (theme: any): TextStyle => ({
  fontSize: 20,
  fontWeight: "700",
  color: theme.colors.text,
})

const $groupInfo: ViewStyle = { flex: 1 }

const $groupHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $groupName = (theme: any): TextStyle => ({
  fontSize: 16,
  fontWeight: "600",
  color: theme.colors.text,
})

const $unreadBadge = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.error,
  borderRadius: spacing.xs,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xs / 2,
  minWidth: spacing.md,
  alignItems: "center",
})

const $unreadText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontSize: 12,
  fontWeight: "700",
})

const $description = (theme: any): TextStyle => ({
  fontSize: 14,
  color: theme.colors.textDim,
  marginTop: spacing.xs / 2,
})

const $memberCount = (theme: any): TextStyle => ({
  fontSize: 12,
  color: theme.colors.textDim,
  marginTop: spacing.xs / 2,
})

const $groupArrow: ViewStyle = {
  marginLeft: spacing.sm,
}

const $arrowText = (theme: any): TextStyle => ({
  fontSize: 24,
  color: theme.colors.tintInactive,
})
