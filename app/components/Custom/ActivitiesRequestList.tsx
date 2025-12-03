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
import { SchedulePreview } from "./SchedulePreview"

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
  title = "Solicitudes de actividades",
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
    return date.toLocaleDateString("es-ES", {
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

    if (diffDays < 0) return "Expirado"
    if (diffDays === 0) return "Expira hoy"
    if (diffDays === 1) return "1 día restante"
    return `${diffDays} días restantes`
  }

  const renderActivityRequest = ({ item }: { item: ActivityRequest }) => {
  const daysLeft = calculateDaysLeft(item.expires_at);
  const isExpired = daysLeft === "Expirado";
  
  // Parse numeric week_timeslots into structured schedule

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
            daysLeft === "Expira hoy" && themed($urgentBadge)
          ]}>
            <Text style={themed($statusText)}>{daysLeft}</Text>
          </View>
        </View>
      </View>

      {/* Weekly Schedule Section */}
     
      <SchedulePreview weekTimeslots={item.week_timeslots} />

      {/* Details Grid */}
      <View style={themed($detailsGrid)}>
        <View style={themed($detailBox)}>
          <Text style={themed($detailLabel)}>Participantes</Text>
          <Text style={themed($detailValue)}>
            De {item.participants_needed} a {item.maximum_participants} personas
          </Text>
        </View>
        
        <View style={themed($detailBox)}>
          <Text style={themed($detailLabel)}>Ubicación</Text>
          <Text style={themed($detailValue)} numberOfLines={2}>
            📍 {item.location_name} 
          </Text>
          <Text style={themed($detailSubtext)}>
            Radio de {item.search_radius}km
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



  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={$loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
          <Text style={themed($loadingText)}>Cargando solicitudes de actividad...</Text>
        </View>
      )
    }

    if (isError) {
      return (
        <View style={$errorContainer}>
          <Text style={themed($errorTitle)}>Algo salió mal</Text>
          <Text style={themed($errorMessage)}>
            {error?.message || "No se pudieron cargar las solicitudes de actividad"}
          </Text>
          <TouchableOpacity
            style={themed($retryButton)}
            onPress={() => refetch()}
            activeOpacity={0.7}
          >
            <Text style={themed($retryButtonText)}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (!data || data.length === 0) {
      return (
        <View style={$emptyContainer}>
          <Text style={themed($emptyIcon)}>🔍</Text>
          <Text style={themed($emptyTitle)}>No Hay Solicitudes de Actividad</Text>
          <Text style={themed($emptyMessage)}>No hay solicitudes de actividad en este momento.</Text>
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
