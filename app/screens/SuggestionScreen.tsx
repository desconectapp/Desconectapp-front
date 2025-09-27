import { observer } from "mobx-react-lite"
import {
  View,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet, // Import StyleSheet
} from "react-native"
import { Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import Animated from "react-native-reanimated"
import { useJoinGroup } from "@/hooks/Groups"

const { height } = Dimensions.get("window")

export const SuggestionScreen = observer(({ route }: any) => {
  const group = route.params?.group
  const { themed } = useAppTheme()
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const navigation = useNavigation()
  const { showToast } = useAppToast()

  const { mutate: joinGroup, isPending: isJoining } = useJoinGroup()

  const handleJoinGroup = () => {
    joinGroup(
      { id: group.id },
      {
        onSuccess: () => {
          showToast("Welcome!", `You've successfully joined ${group.name}`)
          navigation.goBack()
        },
        onError: () => {
          showToast("Join Failed", "Unable to join the group. Please try again.")
        },
      },
    )
  }


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroImageContainer}>
        <Animated.Image
          source={{
            uri:
              group.image ??
              "https://www.hoysejuega.com/uploads/Modules/ImagenesComplejos/800_600_futbol-point-1.png",
          }}
          style={styles.heroImage}
          sharedTransitionTag="2"
        />
        <View style={themed(themedStyles.heroOverlay)} />
        <View style={styles.heroContent}>
          <Text style={styles.heroIcon}>{group.icon}</Text>
          <Text style={themed(themedStyles.heroTitle)}>{group.name}</Text>
          <Text style={themed(themedStyles.heroLocation)}>{group.location}</Text>
        </View>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <View style={themed(themedStyles.activityBadge)}>
            <Text style={themed(themedStyles.activityBadgeText)}>{group.activity}</Text>
          </View>

          <Text style={themed(themedStyles.descriptionText)}>{group.description}</Text>

          <View style={themed(themedStyles.statsContainer)}>
            <View style={styles.statItem}>
              <Text style={themed(themedStyles.statNumber)}>Since</Text>
              <Text style={themed(themedStyles.statLabel)}>{formatDate(group.created_at)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[themed(themedStyles.bottomContainer), $bottomInsets]}>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleJoinGroup}
          disabled={isJoining}
          activeOpacity={0.8}
        >
          <Text style={styles.joinButtonText}>{isJoining ? "Joining..." : "Join Group"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
})


export const styles = StyleSheet.create({
  // SuggestionScreen Styles
  container: { flex: 1 } as ViewStyle,

  // Hero Section
  heroImageContainer: {
    height: height * 0.5,
    position: "relative",
  } as ViewStyle,

  heroImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0", // Placeholder color
  } as ImageStyle,

  heroContent: {
    position: "absolute",
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  } as ViewStyle,

  heroIcon: { 
    fontSize: 32, 
    lineHeight: 48, 
    height: 48 
  } as TextStyle,

  // Content Section
  contentContainer: { flex: 1 } as ViewStyle,

  infoSection: { 
    padding: spacing.lg 
  } as ViewStyle,

  activityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.lg,
    marginBottom: spacing.lg,
  } as ViewStyle,

  statsContainer: {
    flexDirection: "row",
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  } as ViewStyle,

  statItem: {
    flex: 1,
    alignItems: "center",
  } as ViewStyle,

  // Bottom Container (Join Button)
  bottomContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
  } as ViewStyle,

  joinButton: {
    borderWidth: 2,
    borderColor: "#22c55e",
    backgroundColor: "transparent",
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    margin: spacing.sm,
    marginHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,

  joinButtonText: {
    color: "#22c55e",
    fontSize: 18,
    fontWeight: "600",
  } as TextStyle,
})

export const themedStyles = {
  // Hero Section
  heroOverlay: (theme: any): ViewStyle => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  }),

  heroTitle: (theme: any): TextStyle => ({
    fontSize: 32,
    lineHeight: 48,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: spacing.xs,
  }),

  heroLocation: (theme: any): TextStyle => ({
    fontSize: 18,
    color: "#ffffff",
    opacity: 0.9,
  }),

  // Info Section
  activityBadge: (theme: any): ViewStyle => ({
    alignSelf: "flex-start",
    backgroundColor: theme.colors.tint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.lg,
    marginBottom: spacing.lg,
  }),

  activityBadgeText: (theme: any): TextStyle => ({
    color: theme.colors.tintInverse,
    fontSize: 14,
    fontWeight: "600",
  }),

  descriptionText: (theme: any): TextStyle => ({
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    marginBottom: spacing.xl,
  }),

  statsContainer: (theme: any): ViewStyle => ({
    flexDirection: "row",
    backgroundColor: theme.colors.palette.neutral100, // Assuming a light background for the stats block
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  }),

  statNumber: (theme: any): TextStyle => ({
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  }),

  statLabel: (theme: any): TextStyle => ({
    fontSize: 14,
    color: theme.colors.textDim,
  }),

  // Bottom Container (Join Button)
  bottomContainer: (theme: any): ViewStyle => ({
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  }),

  joinButton: (theme: any): ViewStyle => ({
    borderWidth: 2,
    borderColor: theme.colors.palette.success500 || "#22c55e",
    backgroundColor: "transparent",
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    margin: spacing.sm,
    marginHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  }),

  joinButtonText: (theme: any): TextStyle => ({
    color: theme.colors.palette.success500 || "#22c55e",
    fontSize: 18,
    fontWeight: "600",
  }),
}