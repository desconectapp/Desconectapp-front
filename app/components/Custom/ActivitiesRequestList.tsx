"use client"

import { observer } from "mobx-react-lite"
import { useState } from "react"
import {
  View,
  type ViewStyle,
  type TextStyle,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native"
import { Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import type { AppStackScreenProps } from "@/navigators"
import { ActivityRequest } from "@/services/activities/Activities.types"
import { useActivityRequests } from "@/hooks/Search"

const { width } = Dimensions.get("window")

// export interface ActivityRequest {
//   id: string
//   user_id: string
//   activity_id: string
//   description: string
//   week_hours: number[]
//   participants_needed: number
//   maximum_participants: number
//   latitude: number
//   longitude: number
//   search_radius: number
//   created_at: string
//   expires_at: string
// }

interface ActivityRequestsListProps {
  onItemPress?: (item: ActivityRequest) => void
  title?: string
}

export const ActivityRequestsList = observer(function ActivityRequestsList({
  onItemPress,
  title = "Activity Requests",
}: ActivityRequestsListProps) {
  const { themed, theme } = useAppTheme()
  const { data, isLoading, isError, error, refetch } = useActivityRequests()
  const [refreshing, setRefreshing] = useState(false)
  const navigation = useNavigation<AppStackScreenProps<"HomeScreen">["navigation"]>()

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const handleItemPress = (item: ActivityRequest) => {
    if (onItemPress) {
      onItemPress(item)
    } else {
      // Default navigation or action
      console.log("Activity request pressed:", item.id)
    }
  }

  const formatWeekHours = (weekHours: number[]) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    const selectedDays = weekHours
      .map((hour) => {
        const day = Math.floor(hour / 24)
        if (day > 6 || day < 0) {
          return null
        }
        return days[day]
      })
      .filter(Boolean)

    return [...new Set(selectedDays)].join(", ")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const calculateDaysLeft = (expiresAt: string) => {
    const today = new Date()
    const expiryDate = new Date(expiresAt)
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Expired"
    if (diffDays === 0) return "Expires today"
    if (diffDays === 1) return "1 day left"
    return `${diffDays} days left`
  }

  const renderActivityRequest = ({ item }: { item: ActivityRequest }) => {
    const daysLeft = calculateDaysLeft(item.expires_at)
    const isExpired = daysLeft === "Expired"

    return (
      <TouchableOpacity
        style={[themed($requestCard), isExpired && themed($expiredCard)]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
        disabled={isExpired}
      >
        <View style={$cardHeader}>
          <Text style={themed($descriptionText)} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        <View style={$participantsContainer}>
          <Text style={themed($participantsLabel)}>participants</Text>
          <Text style={themed($participantsText)}>
            Min: {item.participants_needed} - Max: {item.maximum_participants}
          </Text>
        </View>

        <View style={$detailsContainer}>
          <View style={$detailItem}>
            <Text style={themed($detailLabel)}>Available on</Text>
            <Text style={themed($detailValue)}>
              {formatWeekHours(item.week_hours) || "Flexible"}
            </Text>
          </View>

          <View style={$detailItem}>
            <Text style={themed($detailLabel)}>Location</Text>
            <Text style={themed($detailValue)}>Within {item.search_radius}km</Text>
          </View>
        </View>

        <View style={themed($footer)}>
          <Text style={themed($dateText)}>Created: {formatDate(item.created_at)}</Text>

          <Text
            style={[
              themed($expiryText),
              isExpired && themed($expiredText),
              daysLeft === "Expires today" && themed($urgentText),
            ]}
          >
            {daysLeft}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={$loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
          <Text style={themed($loadingText)}>Loading activity requests...</Text>
        </View>
      )
    }

    if (isError) {
      return (
        <View style={$errorContainer}>
          <Text style={themed($errorTitle)}>Something went wrong</Text>
          <Text style={themed($errorMessage)}>
            {error?.message || "Failed to load activity requests"}
          </Text>
          <TouchableOpacity
            style={themed($retryButton)}
            onPress={() => refetch()}
            activeOpacity={0.7}
          >
            <Text style={themed($retryButtonText)}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (!data || data.length === 0) {
      return (
        <View style={$emptyContainer}>
          <Text style={themed($emptyIcon)}>🔍</Text>
          <Text style={themed($emptyTitle)}>No Activity Requests</Text>
          <Text style={themed($emptyMessage)}>There are no activity requests at the moment.</Text>
        </View>
      )
    }

    return (
      <FlatList
        style={{ flex: 1 }} // asegurar que la lista ocupe el espacio disponible
        data={data}
        renderItem={renderActivityRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={$listContainer}
        showsVerticalScrollIndicator={false}
        // usar las props nativas de FlatList para pull-to-refresh
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    )
  }

  return (
    <View style={$container}>
      {title && (
        <View style={$headerContainer}>
          <Text style={themed($sectionTitle)}>{title}</Text>
        </View>
      )}

      {renderContent()}
    </View>
  )
})

const $container: ViewStyle = {
  flex: 1,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  marginBottom: spacing.md,
}

const $sectionTitle = (theme: any): TextStyle => ({
  fontSize: 22,
  fontWeight: "700",
  color: theme.colors.text,
})

const $listContainer: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
  gap: spacing.lg,
}

const $requestCard = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.palette.neutral100,
  borderRadius: spacing.lg,
  padding: spacing.lg,
  shadowColor: theme.colors.palette.neutral900,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 3,
  borderWidth: 1,
  borderColor: theme.colors.border,
})

const $expiredCard = (theme: any): ViewStyle => ({
  opacity: 0.7,
  borderColor: theme.colors.palette.neutral400,
})

const $cardHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: spacing.sm,
}

const $participantsContainer: ViewStyle = {
  flexDirection: "column",
  alignItems: "flex-start",
  marginBottom: spacing.sm,
}

const $participantsText = (theme: any): TextStyle => ({
  fontWeight: "600",
  fontSize: 14,
})

const $participantsLabel = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  fontSize: 12,
})

const $expiryContainer: ViewStyle = {
  alignItems: "flex-end",
}

const $expiryText = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  fontSize: 14,
  fontWeight: "500",
})

const $expiredText = (theme: any): TextStyle => ({
  color: theme.colors.error,
})

const $urgentText = (theme: any): TextStyle => ({
  color: theme.colors.error,
  fontWeight: "600",
})

const $descriptionText = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.text,
  // marginBottom: spacing.md,
  lineHeight: 22,
})

const $detailsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.md,
}

const $detailItem: ViewStyle = {
  flex: 1,
}

const $detailLabel = (theme: any): TextStyle => ({
  fontSize: 12,
  color: theme.colors.textDim,
  marginBottom: spacing.xs,
})

const $detailValue = (theme: any): TextStyle => ({
  fontSize: 14,
  color: theme.colors.text,
  fontWeight: "500",
})

const $footer = (theme: any): ViewStyle => ({
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
  paddingTop: spacing.sm,
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-between",
})

const $dateText = (theme: any): TextStyle => ({
  fontSize: 12,
  color: theme.colors.textDim,
  textAlign: "right",
})

const $loadingContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xxl,
}

const $loadingText = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.textDim,
  marginTop: spacing.md,
})

const $errorContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.xl,
}

const $errorIcon: TextStyle = {
  fontSize: 48,
  marginBottom: spacing.md,
}

const $errorTitle = (theme: any): TextStyle => ({
  fontSize: 20,
  fontWeight: "600",
  color: theme.colors.text,
  marginBottom: spacing.sm,
})

const $errorMessage = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.textDim,
  textAlign: "center",
  marginBottom: spacing.lg,
})

const $retryButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderRadius: spacing.md,
})

const $retryButtonText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontWeight: "600",
  fontSize: 16,
})

const $emptyContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.xl,
}

const $emptyIcon: TextStyle = {
  fontSize: 48,
  lineHeight: 64,
  marginBottom: spacing.md,
}

const $emptyTitle = (theme: any): TextStyle => ({
  fontSize: 20,
  fontWeight: "600",
  color: theme.colors.text,
  marginBottom: spacing.sm,
})

const $emptyMessage = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.textDim,
  textAlign: "center",
})
