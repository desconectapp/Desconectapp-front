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
  ImageStyle,
} from "react-native"
import { AutoImage, Icon, Screen, Text } from "@/components"
import type { AppStackScreenProps } from "../navigators"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { PhotoGallerySlider, type PhotoItem } from "@/components/Custom/PhotoGallerySlider"
import { useGroups, useGroupsRecs } from "@/hooks/Groups"
import { spacing } from "@/theme"
import { GroupFront } from "./GroupsFront.types"
import { Group, OpenGroup } from "@/services/groups/Groups.types"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { SafeAreaView } from "react-native-safe-area-context"
import { useGetLastChatMessages } from "@/hooks/Chats"
import { useStores } from "@/models"
import { formatDate } from "@/utils/formatDate"
import { formatDateGroupCard } from "@/utils/formatTime"
import { useGroupMatchNotifications } from "@/hooks/GroupMatchNotifications"

const { width } = Dimensions.get("window")

function addThreeDotsToText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - 3) + "..."
}

export const HomeScreen = observer(function HomeScreen() {
  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const navigation = useNavigation<AppStackScreenProps<"HomeScreen">["navigation"]>()

  const isFocused = useIsFocused()
  const { data: paginatedGroups, isLoading, refetch } = useGroups({ enabled: isFocused })

  const { sessionStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [allGroups, setAllGroups] = useState<Group[]>([])

  // Monitor for new group matches and show notifications
  useGroupMatchNotifications()

  const {
    data: messages,
    isFetching: isLoadingMessages,
    refetch: refetchLastMessages,
  } = useGetLastChatMessages(sessionStore.user_uuid || "")

  const {
    data: recommendedGroups,
    isLoading: isLoadingRecs,
    refetch: refetchRecs,
  } = useGroupsRecs(0, { enabled: isFocused })
  const [refreshingRecs, setRefreshingRecs] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setRefreshingRecs(true)
    try {
      await Promise.all([refetch(), refetchRecs(), refetchLastMessages()])
    } finally {
      setRefreshing(false)
      setRefreshingRecs(false)
    }
  }, [refetch, refetchRecs, refetchLastMessages])

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
    navigation.navigate("CreateGroupScreen")
  }

  const renderGroupCard = ({ item }: { item: GroupFront }) => {
    const sender = item?.members?.find((m) => m.uuid === item.lastMessage?.user_id)

    return (
      <TouchableOpacity
        style={[
          themed(themedStylesGroup.groupCardContainer),
          item.notSeen ? themed(themedStylesGroup.groupCardContainerSeen) : {},
        ]}
        onPress={() => navigation.navigate("GroupScreen", { groupId: item.id })}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <View style={themed(themedStylesGroup.groupCardInner)}>
          {item.avatar_url ? (
            <AutoImage
              source={{ uri: item.avatar_url }}
              style={[
                themed(themedStylesGroup.groupAvatarImage),
                item.notSeen ? themed(themedStylesGroup.groupAvatarImageSeen) : {},
              ]}
            />
          ) : (
            <View style={themed(themedStylesGroup.groupAvatar)}>
              <Text style={themed(themedStylesGroup.groupAvatarText)}>
                {item.icon || item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={themed(themedStylesGroup.groupInfo)}>
            <View style={themed(themedStylesGroup.groupHeader)}>
              <Text style={themed(themedStylesGroup.groupName)} numberOfLines={1}>
                {item.name}
              </Text>
              <Text
                style={[
                  themed(themedStylesGroup.groupSentAt),
                  item.notSeen ? themed(themedStylesGroup.groupSentAtSeen) : {},
                ]}
              >
                {item.lastMessage ? formatDateGroupCard(item.lastMessage?.sent_at) : ""}
              </Text>
            </View>

            <Text style={themed(themedStylesGroup.lastMessage)} numberOfLines={1}>
              {sender && sender.name
                ? `${sender.name.charAt(0).toUpperCase()}${sender.name.slice(1)}: `
                : ""}
              {item.lastMessage ? (
                item.lastMessage.image_url ? (
                  <Text style={themed(themedStylesGroup.lastMessage)}>
                    <FontAwesome5 name="image" size={14} /> Photo
                  </Text>
                ) : (
                  addThreeDotsToText(item.lastMessage.content, 20)
                )
              ) : (
                "No messages yet"
              )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const ListHeaderComponent = () => {
    const myGroupsSection = () => {
      if (isLoading || isLoadingMessages)
        return <ActivityIndicator style={{ marginVertical: 30 }} size="large" />

      if (allGroups.length === 0)
        return (
          <View style={themed(themedStylesGroup.emptyContainer)}>
            <Text style={themed(themedStylesGroup.emptyIcon)}>👥</Text>
            <Text style={themed(themedStylesGroup.emptyTitle)}>No Groups Yet</Text>
            <Text style={themed(themedStylesGroup.emptySubtitle)}>Make your first search!</Text>
          </View>
        )

      const zipped = allGroups.map((g) => {
        const match = messages?.find((o) => o.group_id === g.id)
        return { ...g, lastMessage: match }
      })

      zipped.sort((a, b) => {
        const dateA = a.lastMessage.sent_at ? new Date(a.lastMessage.sent_at).getTime() : 0
        const dateB = b.lastMessage.sent_at ? new Date(b.lastMessage.sent_at).getTime() : 0
        return dateB - dateA
      })

      const limitedGroups = zipped.slice(0, 3)
      return (
        <View style={themed(themedStylesGroup.sectionContainer)}>
          <View style={themed(themedStylesGroup.sectionHeader)}>
            <Text style={themed(themedStylesGroup.sectionTitle)}>My Groups</Text>
            {allGroups.length > 3 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("MyGroupsScreen")}
              >
                <Text style={themed(themedStylesGroup.seeAllText)}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={limitedGroups}
            renderItem={renderGroupCard}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={themed(themedStylesGroup.groupsList)}
          />
        </View>
      )
    }

    const discoverSection = () => (
      <View style={themed(themedStylesGroup.sectionContainer)}>
        <View style={themed(themedStylesGroup.sectionHeader)}>
          <Text style={themed(themedStylesGroup.sectionTitle)}>Discover New Groups</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("NearbyGroupsScreen" as never)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <FontAwesome5 name="globe-americas" size={20} color={theme.colors.tint} />
            <Text style={themed(themedStylesGroup.seeAllText)}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingRecs ? (
          <ActivityIndicator style={{ marginVertical: 20 }} size="large" />
        ) : recommendedPhotoItems.length === 0 ? (
          <View style={themed(themedStylesGroup.emptyContainer)}>
            <Text style={themed(themedStylesGroup.emptySubtitle)}>
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
      <SafeAreaView style={[styles.container, themed(themedStylesGroup.container)]}>
        <View style={themed(themedStylesGroup.header)}>
          <Image
            source={require("../../assets/images/desconectapp_icon.png")}
            style={styles.headerImage}
            resizeMode="contain"
          />
          <Text style={themed([themedStylesGroup.headerTitle, styles.headerTitleOverride])}>
            Groups
          </Text>
          <TouchableOpacity onPress={handleAddGroup} activeOpacity={0.7} style={styles.addButton}>
            <FontAwesome5 name="plus" size={22} color={theme.colors.tint} />
          </TouchableOpacity>
        </View>
        {myGroupsSection()}
        {discoverSection()}
      </SafeAreaView>
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

const styles = StyleSheet.create({
  addButton: {
    position: "absolute",
    right: spacing.md,
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: spacing.xs,
  } as ViewStyle,

  container: { flex: 1 } as ViewStyle,
  headerImage: {
    height: 60,
    left: spacing.md,
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -26 }],
    width: 60,
  },
  headerTitleOverride: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "700",
    flexShrink: 1,
  } as TextStyle,
})

export const themedStylesGroup = {
  container: (theme: any): ViewStyle => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }),

  groupAvatarImage: (_theme: any): ImageStyle => ({
    width: 60,
    height: 60,
    borderRadius: 100,
    resizeMode: "cover",
    marginRight: spacing.md,
  }),

  groupAvatarImageSeen: (theme: any): ImageStyle => ({
    borderWidth: 3,
    borderColor: theme.colors.palette.primary500,
  }),

  header: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.background,
    borderBottomColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    position: "relative",
  }),

  headerTitle: (theme: any): TextStyle => ({
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
  }),

  sectionContainer: (_theme: any): ViewStyle => ({
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
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
    borderWidth: 1,
    borderColor: theme.colors.border,
  }),

  groupCardContainerSeen: (theme: any): ViewStyle => ({
    borderColor: theme.colors.tint,
    borderWidth: 1,
    backgroundColor: theme.colors.palette.primary200,
  }),

  groupCardInner: (_theme: any): ViewStyle => ({
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  }),

  groupAvatar: (theme: any): ViewStyle => ({
    width: 60,
    height: 60,
    borderRadius: 100,
    backgroundColor: theme.colors.tintSoft || theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  }),

  groupAvatarText: (theme: any): TextStyle => ({
    fontSize: 28,
    lineHeight: 32,
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
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  }),

  notSeenCircle: (theme: any): TextStyle => ({
    width: 12,
    height: 12,
    borderRadius: 100,
    backgroundColor: theme.colors.palette.primary500,
    marginLeft: 4,
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

  lastMessage: (theme: any): TextStyle => ({
    fontSize: 14,
    color: theme.colors.textDim,
    marginTop: spacing.xxs,
  }),

  memberCount: (theme: any): TextStyle => ({
    fontSize: 12,
    color: theme.colors.textDim,
    marginTop: spacing.xxs,
  }),

  groupSideInfo: (_theme: any): ViewStyle => ({
    marginLeft: spacing.sm,
    alignItems: "flex-end",
  }),

  groupSentAt: (theme: any): TextStyle => ({
    fontSize: 14,
    color: theme.colors.textDim,
  }),

  groupSentAtSeen: (theme: any): TextStyle => ({
    color: theme.colors.tint,
    fontWeight: "800",
  }),
}
