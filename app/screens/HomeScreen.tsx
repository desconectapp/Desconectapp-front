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
  Image,
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
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"

const { width } = Dimensions.get("window")

export const HomeScreen = observer(function HomeScreen() {
  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const navigation = useNavigation<AppStackScreenProps<"HomeScreen">["navigation"]>()

  // Groups hooks
  const { data: paginatedGroups, isLoading, refetch } = useGroups()
  const [refreshing, setRefreshing] = useState(false)
  const [allGroups, setAllGroups] = useState<Group[]>([])

  // Recommendations
  const { data: recommendedGroups, isLoading: isLoadingRecs, refetch: refetchRecs } = useGroupsRecs(0)
  const [refreshingRecs, setRefreshingRecs] = useState(false)

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
    if (paginatedGroups?.groups) setAllGroups(paginatedGroups.groups)
  }, [paginatedGroups])

  const recommendedPhotoItems: PhotoItem[] =
    recommendedGroups?.groups?.map((group: OpenGroup) => ({
      id: String(group.id),
      title: group.name,
      subtitle: group.activity_name,
      image: group.photo,
    })) || []

  const handleAddGroup = () => {
    //
  }

  const renderGroupCard = ({ item }: { item: GroupFront }) => (
    <TouchableOpacity
      style={themed(themedStyles.groupCardContainer)}
      onPress={() => navigation.navigate("GroupScreen", { groupId: item.id })}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <View style={themed(themedStyles.groupCardInner)}>
        <View style={themed(themedStyles.groupAvatar)}>
          <Text style={themed(themedStyles.groupAvatarText)}>
            {item.icon || item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={themed(themedStyles.groupInfo)}>
          <View style={themed(themedStyles.groupHeader)}>
            <Text style={themed(themedStyles.groupName)} numberOfLines={1}>
              {item.name}
            </Text>

            {item.unreadCount && item.unreadCount > 0 && (
              <View style={themed(themedStyles.unreadBadge)}>
                <Text style={themed(themedStyles.unreadText)}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>

          <Text style={themed(themedStyles.description)} numberOfLines={1}>
            {!isLoading ? item.description || "No description yet" : ""}
          </Text>

          {item.memberCount && (
            <Text style={themed(themedStyles.memberCount)}>
              {item.memberCount} members
            </Text>
          )}
        </View>

        <View style={themed(themedStyles.groupArrow)}>
          <Text style={themed(themedStyles.arrowText)}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const ListHeaderComponent = () => {
    const myGroupsSection = () => {
      if (isLoading && allGroups.length === 0)
        return <ActivityIndicator style={{ marginVertical: 30 }} size="large" />

      if (!isLoading && allGroups.length === 0)
        return (
          <View style={themed(themedStyles.emptyContainer)}>
            <Text style={themed(themedStyles.emptyIcon)}>👥</Text>
            <Text style={themed(themedStyles.emptyTitle)}>No Groups Yet</Text>
            <Text style={themed(themedStyles.emptySubtitle)}>
              Make your first search!
            </Text>
          </View>
        )

      const limitedGroups = allGroups.slice(0, 3)
      return (
        <View style={themed(themedStyles.sectionContainer)}>
          <View style={themed(themedStyles.sectionHeader)}>
            <Text style={themed(themedStyles.sectionTitle)}>My Groups</Text>
            {allGroups.length > 3 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("MyGroupsScreen")}
              >
                <Text style={themed(themedStyles.seeAllText)}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={limitedGroups}
            renderItem={renderGroupCard}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={themed(themedStyles.groupsList)}
          />
        </View>
      )
    }

    const discoverSection = () => (
      <View style={themed(themedStyles.sectionContainer)}>
        <View style={themed(themedStyles.sectionHeader)}>
          <Text style={themed(themedStyles.sectionTitle)}>Discover New Groups</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("NearbyGroupsScreen" as never)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <FontAwesome5 name="globe-americas" size={20} color={theme.colors.tint} />
            <Text style={themed(themedStyles.seeAllText)}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingRecs ? (
          <ActivityIndicator style={{ marginVertical: 20 }} size="large" />
        ) : recommendedPhotoItems.length === 0 ? (
          <View style={themed(themedStyles.emptyContainer)}>
            <Text style={themed(themedStyles.emptySubtitle)}>
              No new groups to recommend right now 👀
            </Text>
          </View>
        ) : (
          <PhotoGallerySlider
            onItemPress={(item) => {
              const selected = recommendedGroups?.groups.find((g) => String(g.id) === item.id)
              if (selected) navigation.navigate("SuggestionScreen", { group: selected })
            }}
            data={recommendedPhotoItems}
            itemWidth={width * 0.42}
          />
        )}
      </View>
    )

    return (
      <View style={[$container, $topInsets]}>
        <View style={themed(themedStyles.header)}>
          <Image
            source={require("../../assets/images/desconectapp_pagelogo.jpeg")}
            style={styles.headerImage}
            resizeMode="contain"
          />
          <Text style={themed([themedStyles.headerTitle, styles.headerTitleOverride])}>
            Groups
          </Text>
          <TouchableOpacity
            onPress={handleAddGroup}
            activeOpacity={0.7}
            style={styles.addButton}
          >
            <FontAwesome5 name="plus" size={22} color={theme.colors.tint} />
          </TouchableOpacity>
        </View>
        {myGroupsSection()}
        {discoverSection()}
      </View>
    )
  }

  return (
    <FlatList
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
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
    />
  )
})

//───────────────────────────────
// STYLES
//───────────────────────────────

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
}

const styles = StyleSheet.create({
  headerImage: {
    width: 40,
    height: 40,
    marginRight: spacing.sm,
  },
  headerTitleOverride: {
    flex: 1,
    textAlign: "center",
    marginLeft: spacing.sm,
  } as TextStyle,
  addButton: {
    padding: spacing.sm,
  } as ViewStyle,
})

//───────────────────────────────
// THEMED STYLES
//───────────────────────────────

export const themedStyles = {
  header: (theme: any): ViewStyle => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  }),

  headerTitle: (theme: any): TextStyle => ({
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
  }),

  sectionContainer: (_theme: any): ViewStyle => ({
    marginBottom: spacing.xl,
  }),

  sectionHeader: (_theme: any): ViewStyle => ({
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  }),

  sectionTitle: (theme: any): TextStyle => ({
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
  }),

  seeAllText: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.tint,
    fontWeight: "600",
  }),

  groupsList: (_theme: any): ViewStyle => ({
    gap: spacing.md,
  }),

  emptyContainer: (_theme: any): ViewStyle => ({
    alignItems: "center",
    paddingVertical: spacing.xxl,
  }),

  emptyIcon: (_theme: any): TextStyle => ({
    fontSize: 64,
    lineHeight: 64,
    marginBottom: spacing.lg,
  }),

  emptyTitle: (theme: any): TextStyle => ({
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: spacing.sm,
  }),

  emptySubtitle: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.textDim,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  }),

  groupCardContainer: (theme: any): ViewStyle => ({
    marginVertical: spacing.xs,
    borderRadius: spacing.sm,
    backgroundColor: theme.colors.card,
    shadowColor: theme.colors.shadow || "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),

  groupCardInner: (_theme: any): ViewStyle => ({
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  }),

  groupAvatar: (theme: any): ViewStyle => ({
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.tintSoft || theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  }),

  groupAvatarText: (theme: any): TextStyle => ({
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.tintInverse,
  }),

  groupInfo: (_theme: any): ViewStyle => ({
    flex: 1,
  }),

  groupHeader: (_theme: any): ViewStyle => ({
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  }),

  groupName: (theme: any): TextStyle => ({
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  }),

  unreadBadge: (_theme: any): ViewStyle => ({
    backgroundColor: "#e53935",
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  }),

  unreadText: (_theme: any): TextStyle => ({
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  }),

  description: (theme: any): TextStyle => ({
    fontSize: 14,
    color: theme.colors.textDim,
    marginTop: spacing.xxs,
  }),

  memberCount: (theme: any): TextStyle => ({
    fontSize: 12,
    color: theme.colors.textDim,
    marginTop: spacing.xxs,
  }),

  groupArrow: (_theme: any): ViewStyle => ({
    marginLeft: spacing.sm,
  }),

  arrowText: (theme: any): TextStyle => ({
    fontSize: 24,
    color: theme.colors.textDim,
  }),
}
