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
import { SchedulePreview } from "@/components/Custom/SchedulePreview"

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
          showToast("¡Bienvenido!", `Te uniste exitosamente a ${group.name}`)
          navigation.goBack()
        },
        onError: () => {
          showToast("Error al Unirse", "No se pudo unir al grupo. Por favor intenta de nuevo.")
        },
      },
    )
  }

  const formatDate = (dateString: string) => {
    let cleanString = dateString
    cleanString = cleanString?.replace(" ", "T")
    cleanString = cleanString?.replace(/ \+0000 UTC$/, "Z")

    const dateObject = new Date(cleanString)

    if (isNaN(dateObject.getTime())) {
      return "N/D"
    }

    return dateObject.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  const radarApiKey = process.env.EXPO_PUBLIC_RADAR_API_KEY
  const groupCoordsMock = "-34.84805455099598,-58.379922809809486"
  console.log("coordsss:", group.coords)
  
  // Handle both array and string formats for coordinates
  let lat, long
  if (Array.isArray(group.coords)) {
    // coords is an array: [lng, lat]
    long = group.coords[0]
    lat = group.coords[1]
  } else if (typeof group.coords === 'string') {
    // coords is a string: "lat,lng"
    lat = group.coords?.split(",")[1]
    long = group.coords?.split(",")[0]
  }
  
  const locationImage = `https://api.radar.io/maps/static?center=${lat},${long}&zoom=13&width=400&height=400&publishableKey=${radarApiKey}`
  console.log("locationImage:", locationImage)
  console.log("group.avatar_url:", group.avatar_url)
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

        <Text style={themed(themedStyles.headerTitle)}>Información del Grupo</Text>
      </View>

      <View style={styles.heroImageContainer}>
        <Animated.Image
          source={
            group.avatar_url || group.image
              ? { uri: group.avatar_url || group.image }
              : require("../../assets/images/desconectapp_icon.png")
          }
          style={styles.heroImage}
          // sharedTransitionTag={group.id.toString()}
        />
        <View style={themed(themedStyles.heroOverlay)} />
        <View style={styles.heroContent}>
          <View style={styles.heroTopRow}></View>
          <View style={styles.heroBottomRow}>
            <View style={styles.heroMainInfo}>
              <Text style={themed(themedStyles.heroIcon)}>{group.icon}</Text>
              <Text style={themed(themedStyles.heroTitle)}>{group.name}</Text>
              <View style={{ flexDirection: "row" }}>
                <View style={styles.heroLocationRow}>
                  <Text style={themed(themedStyles.heroLocationIcon)}>{group.photo}</Text>
                  <Text style={themed(themedStyles.heroLocationText)}>{group.activity_name}</Text>
                </View>
                <View style={styles.heroLocationRow}>
                  <Text style={themed(themedStyles.heroLocationText)}> |</Text>
                </View>
                <View style={styles.heroLocationRow}>
                  <Text style={themed(themedStyles.heroLocationIcon)}>📍</Text>
                  <Text style={themed(themedStyles.heroLocationText)}>
                    {group.location_name || group.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          {/* Description */}
            <Text style={themed(themedStyles.sectionTitle)}>Descripcion</Text>
            {group.description ? (
              <Text style={themed(themedStyles.descriptionText)}>{group.description}</Text>

            ) : (
              <Text style={themed(themedStyles.descriptionText)}>No hay descripcion disponible.</Text>
            )}
        </View>
          <View style={styles.infoSection}>
          <Text style={themed(themedStyles.sectionTitle)}>Ubicacion</Text>
          {locationImage ? (
            <Animated.Image
              source={{ uri: locationImage }}
              style={{ width: "100%", height: 200, marginBottom: spacing.lg, borderRadius: spacing.md,
                borderColor: "#050505ff", borderWidth: 1
               }}
              // sharedTransitionTag={group.id.toString()}
            />

          ) : (
            <Text style={themed(themedStyles.descriptionText)}>No hay ubicacion disponible.</Text>
          )
        
        }
        </View>

        <View style={styles.scheduleSection}>
          <Text style={themed(themedStyles.sectionTitle)}>Horarios</Text>
          <SchedulePreview weekTimeslots={group.week_timeslots} />
        </View>

        {/* Stats Row */}
        <View style={themed(themedStyles.statsContainer)}>
          <View style={styles.statItem}>
            <Text style={themed(themedStyles.statLabel)}>Nos juntamos desde</Text>
            <Text style={themed(themedStyles.statNumber)}>{formatDate(group.created_at)}</Text>
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
          <Text style={themed(themedStyles.joinButtonText)}>
            {isJoining ? "Uniéndose..." : "Unirse al Grupo"}
          </Text>
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
    height: height * 0.28,
    position: "relative",
  } as ViewStyle,

  heroImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0", // Placeholder color
  } as ImageStyle,

  heroContent: {
    position: "absolute",
    top: spacing.md,
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    justifyContent: "space-between",
  } as ViewStyle,

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  } as ViewStyle,

  heroBottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  } as ViewStyle,

  heroMainInfo: {
    flex: 1,
  } as ViewStyle,

  heroLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  } as ViewStyle,

  // Content Section
  contentContainer: { flex: 1 } as ViewStyle,

  infoSection: {
    padding: spacing.lg,
  } as ViewStyle,

  activityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.lg,
    marginBottom: spacing.lg,
  } as ViewStyle,

  statsContainer: {
    backgroundColor: "#f0f0f0", // Placeholder color
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
  } as ViewStyle,

  statItem: {
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

  scheduleSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  } as ViewStyle,
})

export const themedStyles = {
  heroOverlay: (theme: any): ViewStyle => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
    marginRight: spacing.md,
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
    fontSize: 40,
    lineHeight: 48,
    height: 48,
    textAlignVertical: "center",
    marginBottom: spacing.xxs,
    color: theme.colors.palette.neutral100,
  }),

  heroTitle: (theme: any): TextStyle => ({
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.palette.neutral100,
    marginBottom: spacing.xxs,
  }),

  // Moved activity badge to hero for better prominence
  heroActivityBadge: (theme: any): ViewStyle => ({
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  }),

  heroActivityBadgeText: (theme: any): TextStyle => ({
    color: theme.colors.palette.neutral100,
    fontSize: 12,
    fontWeight: "600",
  }),

  heroVisibilityBadge: (theme: any): ViewStyle => ({
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  }),

  heroVisibilityBadgeText: (theme: any): TextStyle => ({
    color: theme.colors.palette.neutral100,
    fontSize: 12,
    fontWeight: "600",
  }),

  // Reorganized info section - location first, then stats, then description
  statsContainer: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.surface ?? theme.colors.palette.neutral100,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
  }),

  statDivider: (theme: any): ViewStyle => ({
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: spacing.md,
  }),

  statNumber: (theme: any): TextStyle => ({
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: spacing.xxs,
  }),

  statLabel: (theme: any): TextStyle => ({
    fontSize: 12,
    color: theme.colors.textDim,
    textTransform: "uppercase",
    fontWeight: "600",
  }),

  sectionTitle: (theme: any): TextStyle => ({
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: spacing.md,
  }),

  descriptionText: (theme: any): TextStyle => ({
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
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

  heroLocationIcon: (theme: any): TextStyle => ({
    fontSize: 14,
    marginRight: spacing.xxs,
  }),

  heroLocationText: (theme: any): TextStyle => ({
    fontSize: 14,
    color: theme.colors.palette.neutral100,
    fontWeight: "500",
  }),
}
