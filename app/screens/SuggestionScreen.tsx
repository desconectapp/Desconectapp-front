import { observer } from "mobx-react-lite"
import {
  View,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
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
  const $topInsets = useSafeAreaInsetsStyle(["top"])
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
    let cleanString = dateString;
    cleanString = cleanString.replace(' ', 'T');
    cleanString = cleanString.replace(/ \+0000 UTC$/, 'Z');
    
    const dateObject = new Date(cleanString);

    if (isNaN(dateObject.getTime())) {
      return "N/A";
    }
    
    return dateObject.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  
  return (
    <View style={styles.container}>
      <View style={[styles.header, themed(themedStyles.header), $topInsets]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 10 }}
        >
          <Text style={themed(themedStyles.backButtonText)}>←</Text>
        </TouchableOpacity>
        
        <Text style={themed(themedStyles.headerTitle)}>{group.name}</Text>

      </View>

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
          <Text style={themed(themedStyles.heroIcon)}>{group.icon}</Text>
          <Text style={themed(themedStyles.heroTitle)}>{group.name}</Text>
          <Text style={themed(themedStyles.heroLocation)}>{group.location}</Text>
        </View>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <View style={themed(themedStyles.activityBadge)}>
            <Text style={themed(themedStyles.activityBadgeText)}>{group.activity_name}</Text>
          </View>

          <Text style={themed(themedStyles.descriptionText)}>{group.description}</Text>

          <View style={themed(themedStyles.statsContainer)}>
            <View style={styles.statItem}>
              <Text style={themed(themedStyles.statLabel)}>Since</Text>
              <Text style={themed(themedStyles.statNumber)}>{formatDate(group.created_at)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[themed(themedStyles.bottomContainer), $bottomInsets]}>
        <TouchableOpacity
          style={themed(themedStyles.joinButton)}
          onPress={handleJoinGroup}
          disabled={isJoining}
          activeOpacity={0.8}
        >
          <Text style={themed(themedStyles.joinButtonText)}>{isJoining ? "Joining..." : "Join Group"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
})


export const styles = StyleSheet.create({
  // SuggestionScreen Styles
  container: { flex: 1 } as ViewStyle,

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  } as ViewStyle,

  headerButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  } as ViewStyle,

  backButton: { paddingRight: spacing.md } as ViewStyle,
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,

  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  } as TextStyle,
  lockButton: { paddingLeft: spacing.md } as ViewStyle,

  // Hero Section
  heroImageContainer: {
    height: height * 0.48,
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

  joinButton: {} as ViewStyle,
  joinButtonText: {} as TextStyle,
})

export const themedStyles = {
  heroOverlay: (theme: any): ViewStyle => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  }),

  header: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.background,
    borderBottomColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  }),
  
  backButtonText: (theme: any): TextStyle => ({
    fontSize: 24,
    color: theme.colors.tint,
    fontWeight: "600",
  }),

  // Header
  headerTitle: (theme: any): TextStyle => ({
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
    flex: 1, 
    marginRight: spacing.md
  }),
  headerButton: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.tint,
    fontWeight: "600",
  }),
  headerCancelButton: (theme: any): TextStyle => ({
    fontSize: 16,
    color: "#e53935",
    fontWeight: "600",
  }),

  heroIcon: (theme: any): TextStyle => ({
    fontSize: 60,
    lineHeight: 72,
    height: 72,
    textAlignVertical: "center",
    marginBottom: spacing.sm,
    color: theme.colors.palette.neutral100, 
  }),

  heroTitle: (theme: any): TextStyle => ({
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.palette.neutral100, 
    marginBottom: spacing.xs,
  }),

  heroLocation: (theme: any): TextStyle => ({
    fontSize: 16, 
    color: theme.colors.palette.neutral200, 
    opacity: 1, 
    marginTop: spacing.xs, 
  }),

  // Info Section
  // UPDATED: Muted background color, primary tint text color for a better badge look
  activityBadge: (theme: any): ViewStyle => ({
    alignSelf: "flex-start",
    backgroundColor: theme.colors.palette.neutral300, // Muted background (lighter gray)
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.lg,
    marginBottom: spacing.lg,
  }),

  // UPDATED: Use tint color for the badge text
  activityBadgeText: (theme: any): TextStyle => ({
    color: theme.colors.tint, // Primary color for text
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
    backgroundColor: theme.colors.surface ?? theme.colors.palette.neutral100, 
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
    borderColor: theme.colors.tint,
    backgroundColor: "transparent",
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    margin: spacing.sm,
    marginHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  }),

  joinButtonText: (theme: any): TextStyle => ({
    color: theme.colors.tint,
    fontSize: 18,
    fontWeight: "600",
  }),
}