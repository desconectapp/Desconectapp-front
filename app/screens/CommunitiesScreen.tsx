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
import { AutoImage, Screen, Text } from "@/components"
import type { AppStackScreenProps } from "../navigators"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { PhotoGallerySlider, type PhotoItem } from "@/components/Custom/PhotoGallerySlider"
import { useGroupsRecs } from "@/hooks/Groups"
import { useCommunity } from "@/hooks/Communities"
import { spacing } from "@/theme"
import { GroupFront } from "./GroupsFront.types"
import { OpenGroup } from "@/services/groups/Groups.types"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { SafeAreaView } from "react-native-safe-area-context"
import { Community, CommunityData } from "@/services/communities"

const { width } = Dimensions.get("window")

export const CommunitiesScreen = observer(function CommunitiesScreen() {
  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const navigation = useNavigation<AppStackScreenProps<"CommunitiesScreen">["navigation"]>() 

  const isFocused = useIsFocused()
  const { data: paginatedCommunities, isLoading, refetch } = useCommunity({ enabled: isFocused })
  const [refreshing, setRefreshing] = useState(false)
  const [allCommunities, setAllCommunities] = useState<Community[]>([]) 
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  useEffect(() => {
    if (paginatedCommunities?.communities) setAllCommunities(paginatedCommunities.communities) 
  }, [paginatedCommunities])

  const handleAddCommunity = () => {
    navigation.navigate("CreateCommunityScreen" as never)
  }

  const renderCommunityCard = ({ item }: { item: Community }) => { 
    return (
      <TouchableOpacity
        style={themed(themedStylesGroup.groupCardContainer)}
        onPress={() => navigation.navigate("CommunityChatScreen", { communityId: item.id })} 
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <View style={themed(themedStylesGroup.groupCardInner)}>
          {item.avatar_url ? (
            <AutoImage
              source={{ uri: item.avatar_url }}
              style={themed(themedStylesGroup.groupAvatarImage)}
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

              {/* {item.unreadCount && item.unreadCount > 0 && (
                <View style={themed(themedStylesGroup.unreadBadge)}>
                  <Text style={themed(themedStylesGroup.unreadText)}>
                    {item.unreadCount > 99 ? "99+" : item.unreadCount}
                  </Text>
                </View> */}
              {/* )} */}
            </View>

            <Text style={themed(themedStylesGroup.description)} numberOfLines={1}>
              {!isLoading ? item.description || "Aún no hay descripción" : ""}
            </Text>

            {item.members_count && (
              <Text style={themed(themedStylesGroup.memberCount)}>{item.members_count} miembros</Text>
            )}
          </View>

          <View style={themed(themedStylesGroup.groupArrow)}>
            <Text style={themed(themedStylesGroup.arrowText)}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const ListHeaderComponent = () => {
    const myCommunitiesSection = () => { 
      if (isLoading && allCommunities.length === 0)
        return <ActivityIndicator style={{ marginVertical: 30 }} size="large" />

      if (!isLoading && allCommunities.length === 0)
        return (
          <View style={themed(themedStylesGroup.emptyContainer)}>
            <Text style={themed(themedStylesGroup.emptyIcon)}>🫂</Text> 
            <Text style={themed(themedStylesGroup.emptyTitle)}>Aún No Hay Comunidades</Text> 
            <Text style={themed(themedStylesGroup.emptySubtitle)}>¡Comienza creando una o revisando tus recomendaciones!</Text> 
          </View>
        )

      const limitedGroups = allCommunities.slice(0, 3)
      return (
        <View style={themed(themedStylesGroup.sectionContainer)}>
          <View style={themed(themedStylesGroup.sectionHeader)}>
            <Text style={themed(themedStylesGroup.sectionTitle)}>Mis Comunidades</Text> 
            {allCommunities.length > 3 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("MyCommunitiesScreen" as never)} 
              >
                <Text style={themed(themedStylesGroup.seeAllText)}>Ver Todo</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={limitedGroups}
            renderItem={renderCommunityCard} 
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={themed(themedStylesGroup.groupsList)}
          />
        </View>
      )
    }



    return (
      <SafeAreaView style={[styles.container, themed(themedStylesGroup.container)]}>
        <View style={themed(themedStylesGroup.header)}>
          <Image
            source={require("../../assets/images/desconectapp_icon.png")}
            style={styles.headerImage}
            resizeMode="contain"
          />
          <Text style={themed([themedStylesGroup.headerTitle, styles.headerTitleOverride])}>
            Comunidades
          </Text> 
          <TouchableOpacity onPress={handleAddCommunity} activeOpacity={0.7} style={styles.addButton}>
            <FontAwesome5 name="plus" size={22} color={theme.colors.tint} />
          </TouchableOpacity>
        </View>
        {myCommunitiesSection()} 
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
          refreshing={refreshing}
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
    width: 50,
    height: 50,
    borderRadius: 24,
    resizeMode: "cover",
    marginRight: spacing.md,
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