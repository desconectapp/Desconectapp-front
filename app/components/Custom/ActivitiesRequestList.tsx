import { observer } from "mobx-react-lite"
import { useState } from "react"
import {
  View,
  type ViewStyle,
  type TextStyle,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
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
//   week_timeslots: number[]
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
  const daysLeft = calculateDaysLeft(item.expires_at);
  const isExpired = daysLeft === "Expired";
  
  // Parse numeric week_timeslots into structured schedule
  const weekSchedule = parseWeekTimeslots(item.week_timeslots);
  
  return (
    <TouchableOpacity
      style={[
        themed($requestCard),
        isExpired && themed($expiredCard)
      ]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.8}
      disabled={isExpired}
    >
      {/* Header Section */}
      <View style={$cardHeader}>
        <View style={$headerTop}>
          <Text style={themed($descriptionText)} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={[
            themed($statusBadge),
            isExpired && themed($expiredBadge),
            daysLeft === "Expires today" && themed($urgentBadge)
          ]}>
            <Text style={themed($statusText)}>{daysLeft}</Text>
          </View>
        </View>
      </View>

      {/* Weekly Schedule Section */}
      <View style={themed($scheduleSection)}>
        <Text style={themed($sectionLabel)}>Horarios Disponibles</Text>
        <View style={$weekScheduleContainer}>
          {weekSchedule.map((day) => (
            <View key={day.dayCode} style={$dayColumn}>
              <View style={themed($dayBar)}>
                {day.timeRanges && day.timeRanges.length > 0 && day.timeRanges.map((range, i) => {
                  const [start, end] = range.split('-');
                  const startMinutes = timeStringToMinutes(start);
                  const endMinutes = timeStringToMinutes(end);
                  const totalMinutes = 24 * 60;
                  
                  const topValue = (startMinutes / totalMinutes) * 140; // 140px bar height  
                  const heightValue = ((endMinutes - startMinutes) / totalMinutes) * 140;

                  console.log(`Rendering segment ${i} for ${day.dayCode}: ${range}, top: ${topValue}, height: ${heightValue}`);

                  return (
                    <View
                      key={`${day.dayCode}-segment-${i}-${range}`}
                      style={[
                        themed($timeSegment),
                        {
                          top: Math.max(0, topValue),
                          height: Math.max(16, heightValue), // Altura mínima más grande
                        },
                      ]}
                    >
                      <View style={themed($segmentContent)}>
                        <Text style={themed($segmentTimeText)}>
                          {start.slice(0,2)}h-{end.slice(0,2)}h
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
              <Text style={themed($dayLabel)}>{day.dayCode}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Details Grid */}
      <View style={themed($detailsGrid)}>
        <View style={themed($detailBox)}>
          <Text style={themed($detailLabel)}>Participantes</Text>
          <Text style={themed($detailValue)}>
            {item.participants_needed}–{item.maximum_participants} personas
          </Text>
          <Text style={themed($detailSubtext)}>
            Mínimo–Máximo
          </Text>
        </View>
        
        <View style={themed($detailBox)}>
          <Text style={themed($detailLabel)}>Ubicación</Text>
          <Text style={themed($detailValue)} numberOfLines={1}>
            📍 Radio de {item.search_radius}km
          </Text>
          <Text style={themed($detailSubtext)}>
            Lat: {item.latitude.toFixed(4)}, Lng: {item.longitude.toFixed(4)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={themed($footer)}>
        <Text style={themed($footerText)}>
          {formatDate(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
    );};

const parseWeekTimeslots = (slots: number[]) => {
  const days = [
    { name: 'Lunes', code: 'L', start: 0 },      // Monday: slots 0-47
    { name: 'Martes', code: 'M', start: 48 },    // Tuesday: slots 48-95
    { name: 'Miércoles', code: 'X', start: 96 }, // Wednesday: slots 96-143
    { name: 'Jueves', code: 'J', start: 144 },   // Thursday: slots 144-191
    { name: 'Viernes', code: 'V', start: 192 },  // Friday: slots 192-239
    { name: 'Sábado', code: 'S', start: 240 },   // Saturday: slots 240-287
    { name: 'Domingo', code: 'D', start: 288 }   // Sunday: slots 288-335
  ];

  return days.map(day => {
    const dayEnd = day.start + 47; // 48 slots per day (0-47 for each day)
    const daySlots = slots.filter(slot => slot >= day.start && slot <= dayEnd).sort((a, b) => a - b);
    
    if (daySlots.length === 0) {
      return {
        dayCode: day.code,
        dayName: day.name,
        isAvailable: false,
        timeRanges: []
      };
    }

    // Group consecutive slots into time ranges
    const timeRanges: string[] = [];
    let rangeStart = daySlots[0];
    let rangeEnd = daySlots[0];

    for (let i = 1; i <= daySlots.length; i++) {
      if (i < daySlots.length && daySlots[i] === rangeEnd + 1) {
        rangeEnd = daySlots[i];
      } else {
        // Convert slot numbers to time strings
        const startTime = slotToTime(rangeStart);
        const endTime = slotToTime(rangeEnd + 1); // +1 because we want the end of the last slot
        timeRanges.push(`${startTime}-${endTime}`);
        
        if (i < daySlots.length) {
          rangeStart = daySlots[i];
          rangeEnd = daySlots[i];
        }
      }
    }

    return {
      dayCode: day.code,
      dayName: day.name,
      isAvailable: true,
      timeRanges
    };
  });
};

// Convert absolute slot number to time string (e.g., "14:30")
// slot 0 = Monday 00:00, slot 1 = Monday 00:30, slot 2 = Monday 01:00, etc.
const slotToTime = (slot: number): string => {
  const totalMinutes = slot * 30; // Each slot is 30 minutes
  const dayMinutes = totalMinutes % (24 * 60); // Minutes within the day
  const hours = Math.floor(dayMinutes / 60);
  const minutes = dayMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Convert time string to minutes (e.g., "14:30" -> 870)
const timeStringToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

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
const $requestCard = {
  backgroundColor: '$background',
  borderRadius: 12,
  padding: 18,
  borderWidth: 1,
  borderColor: '$border',
  shadowColor: '#000000ff',
  elevation: 4,
} as const;

const $expiredCard = {
  opacity: 0.6,
  borderColor: '$muted',
} as const;

const $cardHeader = {
  marginBottom: 16,
} as const;

const $headerTop = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
} as const;

const $descriptionText = {
  fontSize: 16,
  fontWeight: '600',
  color: '$foreground',
  flex: 1,
  lineHeight: 22,
} as const;

const $statusBadge = {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  backgroundColor: '$muted',
} as const;

const $expiredBadge = {
  backgroundColor: '$destructive',
} as const;

const $urgentBadge = {
  backgroundColor: '$warning',
} as const;

const $statusText = {
  fontSize: 11,
  fontWeight: '600',
  color: '$foreground',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
} as const;

const $scheduleSection = {
  marginBottom: 20,
  padding: 16,
  backgroundColor: '$muted',
  borderRadius: 16,
} as const;

const $sectionLabel = {
  fontSize: 12,
  fontWeight: '600',
  color: '$mutedForeground',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 12,
} as const;

const $weekScheduleContainer = {
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'flex-end',
  paddingHorizontal: 8,
} as const;

const $dayBar = {
  width: 32,
  height: 140, // Más altura para dar más espacio
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$border',
  position: 'relative',
  borderRadius: 4,
  marginBottom: 8,
} as const;

const $timeSegment = {
  backgroundColor: '$primary',
  position: 'absolute',
  width: '100%',
  borderRadius: 3,
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0.9,
  borderWidth: 1,
  borderColor: '$primaryForeground',
  paddingVertical: 2, // Espacio interno vertical
} as const;

const $segmentContent = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
} as const;

const $segmentTimeText = {
  color: '$primaryForeground',
  fontSize: 8,
  fontWeight: 'bold',
  textAlign: 'center',
  lineHeight: 10,
} as const;


const $dayLabel = {
  fontSize: 11,
  fontWeight: '600',
  color: '$mutedForeground',
  textAlign: 'center',
} as const;

const $detailsGrid = {
  flexDirection: 'row',
  gap: 12,
  marginBottom: 16,
} as const;

const $detailBox = {
  flex: 1,
  padding: 12,
  backgroundColor: '$muted',
  borderRadius: 12,
} as const;

const $detailLabel = {
  fontSize: 11,
  color: '$mutedForeground',
  marginBottom: 4,
  fontWeight: '500',
} as const;

const $detailValue = {
  fontSize: 14,
  color: '$foreground',
  fontWeight: '600',
} as const;

const $footer = {
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: '$border',
} as const;

const $footerText = {
  fontSize: 11,
  color: '$mutedForeground',
} as const;
const $container: ViewStyle = {
  flex: 1,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  marginBottom: spacing.md,
}

const $sectionTitle = (theme: any): TextStyle => ({
  fontSize: 22,
  fontWeight: "700",
  color: theme.colors.text,
})

const $listContainer: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.xl,
  gap: spacing.lg,
}

const $detailSubtext = {
  fontSize: 10,
  color: '$mutedForeground',
  marginTop: 2,
} as const;

const $dayColumn = {
  alignItems: 'center',
  marginHorizontal: 2,
} as const;


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
