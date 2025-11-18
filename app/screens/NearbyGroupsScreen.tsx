import React, { useState, useCallback, useRef, useEffect } from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Screen, Text } from "@/components"
import { observer } from "mobx-react-lite"
import { MapViewComponent } from "@/components/Location/MapView"
import { MapGroup } from "@/services/groups/Groups.types"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"
import { groupsService } from "@/services/groups"

export const NearbyGroupsScreen = observer(function NearbyGroupsScreen() {
  const { themed } = useAppTheme()

  // State for dynamic group fetching
  const [groups, setGroups] = useState<MapGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  console.log("groups:", groups)
  // Debounced fetch function
  const fetchNearbyGroups = useCallback(async (center: [number, number], radiusKm: number) => {
    try {
      setIsLoading(true)
      console.log(`Fetching groups for center: [${center[0]}, ${center[1]}], radius: ${radiusKm}km`)
      
      const fetchedGroups = await groupsService.getNearbyGroups(
        center[0], // latitude
        center[1], // longitude
        radiusKm
      )
      
      // Smooth transition: only update if there are meaningful changes
      if (JSON.stringify(fetchedGroups.map(g => g.id).sort()) !== JSON.stringify(groups.map(g => g.id).sort())) {
        setGroups(fetchedGroups)
        console.log("Updated groups:", fetchedGroups.length)
      }
    } catch (error) {
      console.error("Error fetching nearby groups:", error)
      // Don't clear groups on error, keep existing ones for better UX
    } finally {
      setIsLoading(false)
    }
  }, [groups])

  // Handle region changes from the map with debouncing
  const handleRegionChange = useCallback((center: [number, number], radiusKm: number) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set new timeout for debounced fetch - reduced delay for smoother experience
    debounceTimeoutRef.current = setTimeout(() => {
      fetchNearbyGroups(center, radiusKm)
    }, 500) // 500ms debounce delay (reduced from 800ms)
  }, [fetchNearbyGroups])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])
  console.log("groups:", groups)
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
      <Text style={themed($title)}>
        Explore groups near your location.
      </Text>
      <View style={themed($mapContainer)}>
        <MapViewComponent
          groups={groups}
          enableDynamicFetch={true}
          onRegionChange={handleRegionChange}
          // onGroupPress={(group) => { Aca creo que habria que redireccionar al grupo, pero 
          // no se si conviene aca o en el MapViewComponent. Primero necesitamos el endpoint de
          // GET grupos igual}}
        />
      </View>
    </Screen>
  )
})

const $title = (theme: any): TextStyle => ({
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: spacing.xs,
  color: theme.colors.text,
  textAlign: "center",
  paddingHorizontal: spacing.lg,
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
