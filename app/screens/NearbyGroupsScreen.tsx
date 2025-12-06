import React, { useState, useCallback, useRef, useEffect } from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity, Modal, FlatList, ListRenderItem, Image } from "react-native"
import { Screen, Text, TextField } from "@/components"
import { observer } from "mobx-react-lite"
import { MapViewComponent } from "@/components/Location/MapView"
import { MapGroup } from "@/services/groups/Groups.types"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"
import { groupsService } from "@/services/groups"
import { useActivities } from "@/hooks/Users"

export const NearbyGroupsScreen = observer(function NearbyGroupsScreen() {
  const { themed } = useAppTheme()

  // State for dynamic group fetching
  const [groups, setGroups] = useState<MapGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'preferences' | 'custom'>('all')
  const [customActivities, setCustomActivities] = useState<any[]>([])
  const [showActivityModal, setShowActivityModal] = useState(false)
  
  // Activity modal state
  const [allActivities, setAllActivities] = useState<any[]>([])
  const [activityOffset, setActivityOffset] = useState(0)
  const [hasMoreActivities, setHasMoreActivities] = useState(true)
  const [activityQuery, setActivityQuery] = useState("")
  const limit = 10
  
  const { data: activitiesData, isFetching: isFetchingActivities } = useActivities(limit, activityOffset, activityQuery)
  // Debounced fetch function
  const fetchNearbyGroups = useCallback(async (center: [number, number], radiusKm: number, overrideFilter?: 'all' | 'preferences' | 'custom') => {
    try {
      setIsLoading(true)
      const currentFilter = overrideFilter || filterType
      console.log(`Fetching groups for center: [${center[0]}, ${center[1]}], radius: ${radiusKm}km, filter: ${currentFilter}`)
      
      // Prepare filter options
      const options: any = {}
      if (currentFilter === 'preferences') {
        options.myPreferences = true
      } else if (currentFilter === 'custom' && customActivities.length > 0) {
        options.activities = customActivities.map(a => a.id)
      }
      
      const fetchedGroups = await groupsService.getNearbyGroups(
        center[0], // latitude
        center[1], // longitude
        radiusKm,
        Object.keys(options).length > 0 ? options : undefined
      )
      console.log('groups: fetched', fetchedGroups)
      // Always update groups immediately for better responsiveness
      setGroups(fetchedGroups)
      // Prefetch all avatar images so they will be cached when rendered in the map
      try {
        const urls = fetchedGroups
          .map((g) => g.avatar_url)
          .filter((u) => !!u) as string[]
        urls.forEach((url) => {
          // Fire & forget prefetch; don't block the UI
          Image.prefetch(url).catch(() => {
            // Prefetch failures are non-fatal; keep moving
          })
        })
      } catch (err) {
        // no-op
      }
      console.log("Updated groups:", fetchedGroups.length)
    } catch (error) {
      console.error("Error fetching nearby groups:", error)
      // Don't clear groups on error, keep existing ones for better UX
    } finally {
      setIsLoading(false)
    }
  }, [filterType, customActivities])

  // Handle region changes from the map with debouncing
  const handleRegionChange = useCallback((center: [number, number], radiusKm: number) => {
    // Validate coordinates
    if (!center || center.length !== 2 || 
        typeof center[0] !== 'number' || typeof center[1] !== 'number' ||
        isNaN(center[0]) || isNaN(center[1]) ||
        typeof radiusKm !== 'number' || isNaN(radiusKm)) {
      console.warn('Invalid coordinates received:', { center, radiusKm })
      return
    }

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set new timeout for debounced fetch - reduced delay for smoother experience
    debounceTimeoutRef.current = setTimeout(() => {
      fetchNearbyGroups(center, radiusKm)
    }, 500) // 500ms debounce delay (reduced from 800ms)
  }, [fetchNearbyGroups])

  // Handle activities data loading
  useEffect(() => {
    if (activitiesData && activitiesData.length > 0) {
      setAllActivities((prev) => {
        const existingIds = new Set(prev.map(item => item.id))
        const newItems = activitiesData.filter(item => !existingIds.has(item.id))
        return [...prev, ...newItems]
      })
      if (activitiesData.length < limit) {
        setHasMoreActivities(false)
      }
    }
  }, [activitiesData])

  // Store current map coordinates for filter changes
  const currentCoordinates = useRef<{center: [number, number], radius: number} | null>(null)
  const forceRefetch = useRef(false)
  
  // Function to trigger refetch with new filter
  const triggerRefetchWithFilter = useCallback((newFilterType: 'all' | 'preferences' | 'custom') => {
    setFilterType(newFilterType)
    forceRefetch.current = true
    
    // If we have coordinates, refetch immediately with the new filter
    if (currentCoordinates.current) {
      const { center, radius } = currentCoordinates.current
      // Pass the new filter directly to avoid timing issues
      fetchNearbyGroups(center, radius, newFilterType)
      forceRefetch.current = false
    }
  }, [fetchNearbyGroups])
  
  // Update coordinates reference whenever region changes
  const handleRegionChangeWithStorage = useCallback((center: [number, number], radiusKm: number) => {
    // Validate and store coordinates
    if (center && center.length === 2 && 
        typeof center[0] === 'number' && typeof center[1] === 'number' &&
        !isNaN(center[0]) && !isNaN(center[1]) &&
        typeof radiusKm === 'number' && !isNaN(radiusKm)) {
      currentCoordinates.current = { center, radius: radiusKm }
      
      // If there's a pending forced refetch, execute it now
      if (forceRefetch.current) {
        forceRefetch.current = false
        // Don't use debounce for forced refetch, use current filter
        fetchNearbyGroups(center, radiusKm, filterType)
        return
      }
    }
    
    handleRegionChange(center, radiusKm)
  }, [handleRegionChange, fetchNearbyGroups])
  
  // Re-fetch when filter type changes with current coordinates
  useEffect(() => {
    if (currentCoordinates.current && !forceRefetch.current) {
      const { center, radius } = currentCoordinates.current
      // Clear any pending debounced calls
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      // Immediate fetch when filter changes
      fetchNearbyGroups(center, radius)
    }
  }, [filterType, customActivities, fetchNearbyGroups])
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])
  
  const handleSaveCustomActivities = () => {
    setShowActivityModal(false)
    // Force immediate re-fetch with custom filter
    triggerRefetchWithFilter('custom')
  }
  
  const toggleActivity = (activity: any) => {
    setCustomActivities((prev) => {
      const exists = prev.some(a => a.id === activity.id)
      if (exists) {
        return prev.filter(a => a.id !== activity.id)
      } else {
        return [...prev, activity]
      }
    })
  }
  
  const renderActivityItem: ListRenderItem<any> = ({ item }) => {
    const selected = customActivities.some(a => a.id === item.id)
    return (
      <TouchableOpacity
        style={themed(selected ? $chipSelected : $chipUnselected)}
        onPress={() => toggleActivity(item)}
      >
        <Text style={themed(selected ? $chipTextSelected : $chipTextUnselected)}>
          {item.icon} {item.name}
        </Text>
      </TouchableOpacity>
    )
  }
  return (
    <Screen
      preset="fixed"
      contentContainerStyle={themed($screenContent)}
      style={themed($screenBackground)}
      KeyboardAvoidingViewProps={{
        behavior: "padding",
        keyboardVerticalOffset: 0,
      }}
    >
      <View style={themed($filterContainer)}>
        <TouchableOpacity 
          style={themed(filterType === 'all' ? $filterButtonActive : $filterButton)}
          onPress={() => {
            const newFilterType = 'all'
            // Force immediate re-fetch with current map state
            triggerRefetchWithFilter(newFilterType)
          }}
        >
          <Text style={themed(filterType === 'all' ? $filterTextActive : $filterText)}>Todos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={themed(filterType === 'preferences' ? $filterButtonActive : $filterButton)}
          onPress={() => {
            const newFilterType = 'preferences'
            // Force immediate re-fetch with current map state
            triggerRefetchWithFilter(newFilterType)
          }}
        >
          <Text style={themed(filterType === 'preferences' ? $filterTextActive : $filterText)}>Mis gustos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={themed(filterType === 'custom' ? $filterButtonActive : $filterButton)}
          onPress={() => setShowActivityModal(true)}
        >
          <Text style={themed(filterType === 'custom' ? $filterTextActive : $filterText)}>
            {filterType === 'custom' && customActivities.length > 0 
              ? `${customActivities.length} actividades` 
              : 'Personalizar'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={themed($mapContainer)}>
        <MapViewComponent
          groups={groups}
          enableDynamicFetch={true}
          onRegionChange={handleRegionChangeWithStorage}
          // onGroupPress={(group) => { Aca creo que habria que redireccionar al grupo, pero 
          // no se si conviene aca o en el MapViewComponent. Primero necesitamos el endpoint de
          // GET grupos igual}}
        />
      </View>
      
      {/* Activity Selection Modal */}
      <Modal
        visible={showActivityModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowActivityModal(false)}
      >
        <View style={themed($modalContainer)}>
          <View style={themed($modalHeader)}>
            <Text style={themed($modalTitle)}>Seleccionar Actividades</Text>
            <TouchableOpacity
              onPress={() => setShowActivityModal(false)}
              style={themed($modalCloseButton)}
            >
              <Text style={themed($modalCloseText)}>×</Text>
            </TouchableOpacity>
          </View>
          
          <TextField
            value={activityQuery}
            onChangeText={(text) => {
              setActivityOffset(0)
              setActivityQuery(text)
              setAllActivities([])
              setHasMoreActivities(true)
            }}
            placeholder="Buscar actividades..."
            style={themed($modalSearchInput)}
            containerStyle={themed($modalSearchInputContainer)}
          />
          
          <FlatList
            data={allActivities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={themed($modalListContent)}
            onEndReached={() => {
              if (hasMoreActivities && !isFetchingActivities) {
                setActivityOffset(prev => prev + limit)
              }
            }}
            onEndReachedThreshold={0.6}
            ListFooterComponent={() => (
              isFetchingActivities ? (
                <Text style={themed($loadingText)}>Cargando...</Text>
              ) : null
            )}
          />
          
          <View style={themed($modalFooter)}>
            <Text style={themed($selectedCount)}>
              {customActivities.length} actividades seleccionadas
            </Text>
            <View style={themed($modalButtons)}>
              <TouchableOpacity
                style={themed($modalSecondaryButton)}
                onPress={() => {
                  setCustomActivities([])
                  setShowActivityModal(false)
                }}
              >
                <Text style={themed($modalSecondaryButtonText)}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={themed($modalPrimaryButton)}
                onPress={handleSaveCustomActivities}
              >
                <Text style={themed($modalPrimaryButtonText)}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  )
})

const $filterContainer = (theme: any): ViewStyle => ({
  flexDirection: "row",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  gap: spacing.xs,
})

const $filterButton = (theme: any): ViewStyle => ({
  flex: 1,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.xs,
  borderRadius: spacing.sm,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.background,
  alignItems: "center",
})

const $filterButtonActive = (theme: any): ViewStyle => ({
  flex: 1,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.xs,
  borderRadius: spacing.sm,
  borderWidth: 1,
  borderColor: theme.colors.tint,
  backgroundColor: theme.colors.tint,
  alignItems: "center",
})

const $filterText = (theme: any): TextStyle => ({
  fontSize: 12,
  fontWeight: "500",
  color: theme.colors.text,
  textAlign: "center",
})

const $filterTextActive = (theme: any): TextStyle => ({
  fontSize: 12,
  fontWeight: "600",
  color: theme.colors.background,
  textAlign: "center",
})

const $modalContainer = (theme: any): ViewStyle => ({
  flex: 1,
  backgroundColor: theme.colors.background,
})

const $modalHeader = (theme: any): ViewStyle => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: spacing.lg,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
})

const $modalTitle = (theme: any): TextStyle => ({
  fontSize: 18,
  fontWeight: "600",
  color: theme.colors.text,
})

const $modalCloseButton = (theme: any): ViewStyle => ({
  padding: spacing.xs,
})

const $modalCloseText = (theme: any): TextStyle => ({
  fontSize: 24,
  color: theme.colors.textDim,
})

const $modalSearchInput = (theme: any): TextStyle => ({
  borderWidth: 1,
  borderColor: theme.colors.border,
  borderRadius: spacing.sm,
  padding: spacing.md,
})

const $modalSearchInputContainer = (theme: any): ViewStyle => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
})

const $modalListContent = (theme: any): ViewStyle => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
})

const $chipUnselected = (theme: any): ViewStyle => ({
  flex: 1,
  margin: spacing.xs,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: spacing.lg,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.background,
  alignItems: "center",
})

const $chipSelected = (theme: any): ViewStyle => ({
  flex: 1,
  margin: spacing.xs,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: spacing.lg,
  borderWidth: 1,
  borderColor: theme.colors.tint,
  backgroundColor: theme.colors.tint,
  alignItems: "center",
})

const $chipTextUnselected = (theme: any): TextStyle => ({
  fontSize: 12,
  color: theme.colors.text,
  textAlign: "center",
})

const $chipTextSelected = (theme: any): TextStyle => ({
  fontSize: 12,
  color: theme.colors.background,
  textAlign: "center",
  fontWeight: "500",
})

const $modalFooter = (theme: any): ViewStyle => ({
  padding: spacing.lg,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
})

const $selectedCount = (theme: any): TextStyle => ({
  fontSize: 14,
  color: theme.colors.textDim,
  textAlign: "center",
  marginBottom: spacing.md,
})

const $modalButtons = (theme: any): ViewStyle => ({
  flexDirection: "row",
  gap: spacing.md,
})

const $modalSecondaryButton = (theme: any): ViewStyle => ({
  flex: 1,
  paddingVertical: spacing.md,
  borderRadius: spacing.sm,
  borderWidth: 1,
  borderColor: theme.colors.border,
  alignItems: "center",
})

const $modalSecondaryButtonText = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.text,
  fontWeight: "500",
})

const $modalPrimaryButton = (theme: any): ViewStyle => ({
  flex: 1,
  paddingVertical: spacing.md,
  borderRadius: spacing.sm,
  backgroundColor: theme.colors.tint,
  alignItems: "center",
})

const $modalPrimaryButtonText = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.background,
  fontWeight: "600",
})

const $loadingText = (theme: any): TextStyle => ({
  textAlign: "center",
  padding: spacing.md,
  color: theme.colors.textDim,
})
const $mapContainer = (theme: any): ViewStyle => ({
  flex: 1,
  minHeight: 300, // Ensure minimum height for map
  backgroundColor: theme.colors.background,
  borderRadius: 12,
  overflow: "hidden",
})

const $screenContent = (theme: any): ViewStyle => ({
  flex: 1,
  padding: 2,
})

const $screenBackground = (theme: any) => ({
  backgroundColor: theme.colors.background,
})
