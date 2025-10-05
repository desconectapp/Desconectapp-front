import React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Screen, Text } from "@/components"
import { observer } from "mobx-react-lite"
import { MapGroup, MapViewComponent } from "@/components/Location/MapView"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"
import { useNearbyGroups } from "@/hooks/Groups"

export const NearbyGroupsScreen = observer(function NearbyGroupsScreen() {
  const { themed } = useAppTheme()

  const {data: groups} = useNearbyGroups(-34.6037, -58.3816, 2)
  console.log("Nearby groups:", groups)
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
      <Text style={themed($title)}>Explore groups near your location.</Text>
      <View style={themed($mapContainer)}>
        <MapViewComponent
          groups={groups}
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
