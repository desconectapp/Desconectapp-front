
import { observer } from "mobx-react-lite"
import { useState } from "react"
import {
  View,
  type ViewStyle,
  type TextStyle,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StyleSheet,
} from "react-native"
import { spacing } from "@/theme"
import { Screen, Text } from "@/components"
import type { AppStackScreenProps } from "../navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { useCommunity } from "@/hooks/Communities"
import { Community } from "@/services/communities"
import { useSafeAreaInsets } from "react-native-safe-area-context" 


type NavigationProp = AppStackScreenProps<"MyCommunitiesScreen">["navigation"]

export const MyCommunitiesScreen = observer(function MyCommunitiesScreen() {
  const { themed, theme } = useAppTheme()
  const navigation = useNavigation<NavigationProp>()
  const isFocused = useIsFocused()
  const insets = useSafeAreaInsets()
  const { data: paginatedCommunities, isLoading, refetch } = useCommunity({ enabled: isFocused })
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }

  const renderGroupCard = ({ item }: { item: Community }) => (
    <TouchableOpacity
      style={themed(styles.groupCardContainer)}
      onPress={() => navigation.navigate("CommunityScreen", { communityId: item.id })}
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

        <View style={styles.groupInfo}>
          <View style={styles.groupHeader}>
            <Text style={themed(styles.groupName)} numberOfLines={1}>
              {item.name}
            </Text>
            {/* ... */}
          </View>

          <Text style={themed(styles.description)} numberOfLines={1}>
            {!isLoading ? item.description || "Aún no hay descripción" : ""}
          </Text>

          {item.members_count && (
            <Text style={themed(styles.memberCount)}>
              {item.members_count} miembros
            </Text>
          )}
        </View>

        <View style={styles.groupArrow}>
          <Text style={themed(styles.arrowText)}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  )


  return (
    <Screen preset="fixed" safeAreaEdges={["bottom"]} style={themed(themedStyles.headerBackground)}>
      <View style={[styles.header, { paddingTop: insets.top }, themed(themedStyles.headerBackground)]}>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 10 }}
        >
          <Text style={themed(themedStyles.backButtonText)}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerInfo}
          activeOpacity={1}
        >
          <View style={styles.headerTextContainer}>
            <Text style={themed(themedStyles.nameTheme)}>{"Mis Comunidades"}</Text>
            </View>
        </TouchableOpacity>

        <View style={styles.headerAction} />
      </View>
      {/* --- */}

      <FlatList
        data={paginatedCommunities?.communities || []}
        renderItem={renderGroupCard}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={() => {
          if (paginatedCommunities?.has_more && !isLoading) refetch()
        }}
        onEndReachedThreshold={0.5}
      />
    </Screen>
  )
})


// --- Style Updates ---

const styles = StyleSheet.create({

    backButton: { paddingRight: spacing.md } as ViewStyle,
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
    } as ViewStyle,
  
    headerAction: { paddingLeft: spacing.md } as ViewStyle,
  
    headerInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    } as ViewStyle,
  
    headerTextContainer: { flex: 1 } as ViewStyle,
  // Existing Styles
  groupCardContainer: {
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 12,
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

export const themedStyles = {
  headerBackground: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.background,
    borderBottomColor: theme.colors.border,
  }),
  backButtonText: (theme: any): TextStyle => ({
    fontSize: 24,
    color: theme.colors.tint,
    fontWeight: "600",
  }),
  nameTheme: (theme: any): TextStyle => ({
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  }),
}