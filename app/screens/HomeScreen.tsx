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
  StyleSheet,
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
      style={themed(styles.groupCardContainer)}
      onPress={() => navigation.navigate("GroupScreen", { groupId: item.id })}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <View style={themed(styles.groupCardInner)}>
        {/* Avatar */}
        <View style={themed(styles.groupAvatar)}>
          <Text style={themed(styles.groupAvatarText)}>
            {item.icon || item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
  
        {/* Group Info */}
        <View style={styles.groupInfo}>
          <View style={styles.groupHeader}>
            <Text style={themed(styles.groupName)} numberOfLines={1}>
              {item.name}
            </Text>
  
            {item.unreadCount && item.unreadCount > 0 && (
              <View style={themed(styles.unreadBadge)}>
                <Text style={themed(styles.unreadText)}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
  
          <Text style={themed(styles.description)} numberOfLines={1}>
            {!isLoading ? item.description || "No description yet" : ""}
          </Text>
  
          {item.memberCount && (
            <Text style={themed(styles.memberCount)}>
              {item.memberCount} members
            </Text>
          )}
        </View>
  
        {/* Arrow */}
        <View style={styles.groupArrow}>
          <Text style={themed(styles.arrowText)}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
  
  const ListHeaderComponent = () => {
    // This is the My Groups section
    const myGroupsSection = () => {
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

  const discoverNewGroupsSection = () => {
    return (
      <View style={$suggestionsSection}>
        {/* Section Title */}
        <View style={$sectionHeader}>
          <Text style={themed($sectionTitle)}>Discover New Groups</Text>
        </View>

        {/* Content depending on state */}
        {isLoadingRecs ? (
          <ActivityIndicator style={{ marginVertical: 20 }} size="large" />
        ) : recommendedPhotoItems.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <Text style={themed({ fontSize: 16, color: theme.colors.textDim })}>
              No new groups to recommend right now 👀
            </Text>
          </View>
        ) : (
          <PhotoGallerySlider
            onItemPress={(item) => {
              // Find the full group object that matches the pressed photo item
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

  // The main FlatList is a dummy, as all content is in the header
  return (
    <FlatList
      data={[{ key: "content" }]}
      renderItem={() => null} 
      keyExtractor={(item) => item.key}
      refreshControl={
        <RefreshControl refreshing={refreshing || refreshingRecs} onRefresh={onRefresh} tintColor={theme.colors.tint} />
      }
      onEndReached={() => null} 
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={isLoadingRecs ? <ActivityIndicator style={{ marginVertical: 20 }} size="large" /> : null}
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

const styles = StyleSheet.create({
  groupCardContainer: {
    marginVertical: 6,
    marginHorizontal: 0,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: '#fff', // fallback
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  groupCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  groupArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 24,
    color: '#ccc',
  },
})