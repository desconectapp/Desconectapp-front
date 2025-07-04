import { observer } from "mobx-react-lite"
import { useState } from "react"
import {
  View,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native"
import { Screen, Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import Animated from "react-native-reanimated"

const { width, height } = Dimensions.get("window")

interface Member {
  id: string
  name: string
  picture?: string
}

interface GroupData {
  id: string
  name: string
  description: string
  created_at: string
  activity: string
  icon: string
  location: string
  members: Member[]
}

const mockGroupData: GroupData = {
  id: "group456",
  name: "Futbol 5 equipo amateur",
  description:
    "Estamos buscando equipo de futbol 5 amateur en palermo. Buscamos jugadores apasionados por el deporte y con ganas de divertirse.",
  created_at: "2023-09-15T10:00:00Z",
  activity: "Football",
  icon: "⚽",
  location: "Palermo, Buenos Aires",
  members: [
    { id: "1", name: "Messi" },
    { id: "2", name: "Suarez" },
    { id: "3", name: "Neymar Jr" },
  ],
}

export const SuggestionScreen = ({ route }: any) => {
  const { groupId } = route.params || {}
  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const [isJoining, setIsJoining] = useState(false)
  const navigation = useNavigation()
  const { showToast } = useAppToast()

  const handleJoinGroup = async () => {
    setIsJoining(true)

    try {
      showToast("Welcome to the group!", `You've successfully joined ${mockGroupData.name}`)
      navigation.goBack()
    } catch (error) {
      showToast("Join Failed", "Unable to join the group. Please try again.")
    } finally {
      setIsJoining(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderMemberAvatars = () => {
    const visibleMembers = mockGroupData.members.slice(0, 4)
    const remainingCount = mockGroupData.members.length - 4

    return (
      <View style={$membersAvatarContainer}>
        {visibleMembers.map((member, index) => (
          <View
            key={member.id}
            style={[$memberAvatar, { marginLeft: index > 0 ? -spacing.sm : 0 }]}
          >
            {member.picture ? (
              <Image source={{ uri: member.picture }} style={$memberAvatarImage} />
            ) : (
              <View style={themed($memberAvatarPlaceholder)}>
                <Text style={themed($memberAvatarText)}>{member.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[themed($memberAvatarPlaceholder), { marginLeft: -spacing.sm }]}>
            <Text style={themed($memberAvatarText)}>+{remainingCount}</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={$container}>
      <View style={$heroImageContainer}>
        <Animated.Image
          source={{
            uri: "https://www.hoysejuega.com/uploads/Modules/ImagenesComplejos/800_600_futbol-point-1.png",
          }}
          style={$heroImage}
          sharedTransitionTag="2"
        />

        <View style={themed($heroOverlay)} />
        <View style={$heroContent}>
          <Text style={$heroIcon}>{mockGroupData.icon}</Text>
          <Text style={themed($heroTitle)}>{mockGroupData.name}</Text>
          <Text style={themed($heroLocation)}>{mockGroupData.location}</Text>
        </View>
      </View>

      <ScrollView style={$contentContainer} showsVerticalScrollIndicator={false}>
        <View style={$infoSection}>
          <View style={$activityBadge}>
            <Text style={themed($activityBadgeText)}>{mockGroupData.activity}</Text>
          </View>

          <Text style={themed($descriptionText)}>{mockGroupData.description}</Text>

          <View style={$statsContainer}>
            <View style={$statItem}>
              <Text style={themed($statNumber)}>{mockGroupData.members.length}</Text>
              <Text style={themed($statLabel)}>Members</Text>
            </View>
            <View style={$statDivider} />
            <View style={$statItem}>
              <Text style={themed($statNumber)}>Since</Text>
              <Text style={themed($statLabel)}>
                {formatDate(mockGroupData.created_at).split(",")[1]}
              </Text>
            </View>
          </View>

          <View style={$membersSection}>
            <Text style={themed($sectionTitle)}>Members</Text>
            {renderMemberAvatars()}
            <Text style={themed($membersText)}>
              {mockGroupData.members
                .slice(0, 3)
                .map((m) => m.name.split(" ")[0])
                .join(", ")}
              {mockGroupData.members.length > 3 &&
                ` and ${mockGroupData.members.length - 3} others`}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[$bottomContainer, $bottomInsets]}>
        <TouchableOpacity
          style={themed($joinButton)}
          onPress={handleJoinGroup}
          disabled={isJoining}
          activeOpacity={0.8}
        >
          <Text style={themed($joinButtonText)}>{isJoining ? "Joining..." : "Join Group"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
}

const $heroImageContainer: ViewStyle = {
  height: height * 0.5,
  position: "relative",
}

const $heroImage: ImageStyle = {
  width: "100%",
  height: "100%",
  backgroundColor: "#f0f0f0",
}

const $heroOverlay = (theme: any): ViewStyle => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
})

const $heroContent: ViewStyle = {
  position: "absolute",
  bottom: spacing.xl,
  left: spacing.lg,
  right: spacing.lg,
}

const $heroIcon: TextStyle = {
  fontSize: 32,
  lineHeight: 48,
  height: 48,
}

const $heroTitle = (theme: any): TextStyle => ({
  fontSize: 32,
  lineHeight: 48,
  height: 48,
  fontWeight: "bold",
  color: "#ffffff",
  marginBottom: spacing.xs,
})

const $heroLocation = (theme: any): TextStyle => ({
  fontSize: 18,
  color: "#ffffff",
  opacity: 0.9,
})

const $contentContainer: ViewStyle = {
  flex: 1,
}

const $infoSection: ViewStyle = {
  padding: spacing.lg,
}

const $activityBadge = (theme: any): ViewStyle => ({
  alignSelf: "flex-start",
  backgroundColor: theme.colors.tint,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: spacing.lg,
  marginBottom: spacing.lg,
})

const $activityBadgeText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontSize: 14,
  fontWeight: "600",
})

const $descriptionText = (theme: any): TextStyle => ({
  fontSize: 16,
  lineHeight: 24,
  color: theme.colors.text,
  marginBottom: spacing.xl,
})

const $statsContainer = (theme: any): ViewStyle => ({
  flexDirection: "row",
  backgroundColor: theme.colors.palette.neutral100,
  borderRadius: spacing.md,
  padding: spacing.lg,
  marginBottom: spacing.xl,
})

const $statItem: ViewStyle = {
  flex: 1,
  alignItems: "center",
  flexDirection: "column",
  gap: 0,
  marginBottom: spacing.sm,
}

const $statNumber = (theme: any): TextStyle => ({
  fontSize: 20,
  fontWeight: "bold",
  color: theme.colors.text,
  // marginBottom: spacing.xs,
})

const $statLabel = (theme: any): TextStyle => ({
  fontSize: 14,
  color: theme.colors.textDim,
})

const $statDivider = (theme: any): ViewStyle => ({
  width: 1,
  backgroundColor: theme.colors.border,
  marginHorizontal: spacing.md,
})

const $membersSection: ViewStyle = {
  // marginBottom: spacing.xl,
}

const $sectionTitle = (theme: any): TextStyle => ({
  fontSize: 18,
  fontWeight: "600",
  color: theme.colors.text,
  marginBottom: spacing.md,
})

const $membersAvatarContainer: ViewStyle = {
  flexDirection: "row",
  marginBottom: spacing.sm,
}

const $memberAvatar: ViewStyle = {
  borderWidth: 2,
  borderColor: "#ffffff",
  borderRadius: 20,
}

const $memberAvatarImage: ImageStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
}

const $memberAvatarPlaceholder = (theme: any): ViewStyle => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: theme.colors.tint,
  justifyContent: "center",
  alignItems: "center",
})

const $memberAvatarText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontSize: 14,
  fontWeight: "600",
})

const $membersText = (theme: any): TextStyle => ({
  fontSize: 14,
  color: theme.colors.textDim,
  lineHeight: 20,
})

const $bottomContainer = (theme: any): ViewStyle => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
  backgroundColor: theme.colors.background,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
})

const $joinButton = (theme: any): ViewStyle => ({
  borderWidth: 2,
  borderColor: "#22c55e",
  backgroundColor: "transparent",
  borderRadius: spacing.md,
  paddingVertical: spacing.md,

  margin: spacing.sm,
  marginHorizontal: spacing.xl,

  alignItems: "center",
  justifyContent: "center",
})

const $joinButtonText = (theme: any): TextStyle => ({
  color: "#22c55e",
  fontSize: 18,
  fontWeight: "600",
})
