import { Group } from "@/services/groups/Groups.types"

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
import { useGroups } from "@/hooks/Groups"
import { spacing } from "@/theme"
import { GroupFront } from "./GroupsFront.types"


type NavigationProp = AppStackScreenProps<"MyGroupsScreen">["navigation"]

export const MyGroupsScreen = observer(function MyGroupsScreen() {
  const { themed, theme } = useAppTheme()
  const navigation = useNavigation<NavigationProp>()
  const { data: paginatedGroups, isLoading, refetch } = useGroups()
  const [refreshing, setRefreshing] = useState(false)
  const styles = createGroupStyles(theme)


  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }

  //   const renderGroupCard = ({ item }: { item: Group }) => (
  //     <TouchableOpacity
  //       onPress={() => navigation.navigate("GroupScreen", { groupId: item.id })}
  //       activeOpacity={0.8}
  //     >
  //       <Text>{item.name}</Text>
  //       <Text>{item.members_count} members</Text>
  //     </TouchableOpacity>
  //   )

  const renderGroupCard = ({ item }: { item: GroupFront }) => (
    <TouchableOpacity
      style={themed(styles.groupCard)}
      onPress={() => navigation.navigate("GroupScreen", { groupId: item.id })}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <View style={styles.groupCard}>
        <View style={themed(styles.groupAvatar)}>
          <Text style={themed(styles.groupAvatarText)}>
            {item.icon || item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

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

          {/* <Text style={styles.lastMessage} numberOfLines={1}>
              {!isLoading ? item.lastMessage || "No messages yet" : ""}
            </Text>

            {item.memberCount && <Text style={themed(styles.memberCount)}>{item.memberCount} members</Text>} */}
        </View>

        <View style={styles.groupArrow}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <FlatList
      data={paginatedGroups?.groups || []}
      renderItem={renderGroupCard}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onEndReached={() => {
        if (paginatedGroups?.has_more && !isLoading) refetch()
      }}
      onEndReachedThreshold={0.5}
    />
  )
})


export const createGroupStyles = (theme: any) => {
  return StyleSheet.create({
    groupCard: {
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
    } as ViewStyle,

    groupCardContent: {
      flexDirection: "row",
      alignItems: "center",
    } as ViewStyle,

    groupAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.tint,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
    } as ViewStyle,

    groupAvatarText: {
      color: theme.colors.tintInverse,
      fontSize: 20,
      fontWeight: "600",
    } as TextStyle,

    groupInfo: {
      flex: 1,
    } as ViewStyle,

    groupHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.xs,
    } as ViewStyle,

    groupName: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
    } as TextStyle,

    unreadBadge: {
      backgroundColor: theme.colors.error,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.xs,
    } as ViewStyle,

    unreadText: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "600",
    } as TextStyle,

    lastMessage: {
      fontSize: 14,
      color: theme.colors.textDim,
      marginBottom: spacing.xs,
    } as TextStyle,

    memberCount: {
      fontSize: 12,
      color: theme.colors.textDim,
      fontWeight: "500",
    } as TextStyle,

    groupArrow: {
      marginLeft: spacing.sm,
    } as ViewStyle,

    arrowText: {
      fontSize: 24,
      color: theme.colors.textDim,
      fontWeight: "300",
    } as TextStyle,
  })
}