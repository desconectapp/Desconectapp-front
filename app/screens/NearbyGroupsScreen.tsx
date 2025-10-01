import React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Screen, Text } from "@/components"
import { observer } from "mobx-react-lite"
import { MapGroup, MapViewComponent } from "@/components/Location/MapView"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"

export const NearbyGroupsScreen = observer(function NearbyGroupsScreen() {
  const { themed } = useAppTheme()
  // Mock de GET groupos cercanos hasta tener el endpoint real
  const groups: MapGroup[] = [
    {
      id: "group-1",
      name: "Recoleta Runners",
      coordinates: [-58.3936, -34.5889],
      radius: 2,
      location: "Recoleta, Buenos Aires",
      description: "Running group meeting every morning.",
      membersCount: 15,
      icon: "🏃‍♂️",
    },
    {
      id: "group-2",
      name: "Palermo Book Club",
      coordinates: [-58.4302, -34.5731],
      radius: 1.5,
      location: "Palermo, Buenos Aires",
      description: "Weekly book discussions in the park.",
      membersCount: 8,
      icon: "📚",
    },
    {
      id: "group-3",
      name: "San Telmo Artists",
      coordinates: [-58.3737, -34.6197],
      radius: 1,
      location: "San Telmo, Buenos Aires",
      description: "Open-air painting sessions.",
      membersCount: 12,
      icon: "🎨",
    },
    {
      id: "group-4",
      name: "Belgrano Cyclists",
      coordinates: [-58.4561, -34.5622],
      radius: 3,
      location: "Belgrano, Buenos Aires",
      description: "Weekend cycling tours.",
      membersCount: 20,
      icon: "🚴‍♀️",
    },
    {
      id: "group-5",
      name: "Microcentro Chess Club",
      coordinates: [-58.3816, -34.6037],
      radius: 0.5,
      location: "Microcentro, Buenos Aires",
      description: "Casual chess games after work.",
      membersCount: 10,
      icon: "♟️",
    },
    {
      id: "group-6",
      name: "Caballito Yoga",
      coordinates: [-58.4438, -34.6187],
      radius: 1.2,
      location: "Caballito, Buenos Aires",
      description: "Outdoor yoga sessions in Parque Centenario.",
      membersCount: 18,
      icon: "🧘‍♀️",
    },
    {
      id: "group-7",
      name: "Villa Crespo Foodies",
      coordinates: [-58.4371, -34.6012],
      radius: 1,
      location: "Villa Crespo, Buenos Aires",
      description: "Exploring local restaurants and food fairs.",
      membersCount: 22,
      icon: "🍔",
    },
    {
      id: "group-8",
      name: "Puerto Madero Photographers",
      coordinates: [-58.3625, -34.6083],
      radius: 1.5,
      location: "Puerto Madero, Buenos Aires",
      description: "Photo walks along the docks.",
      membersCount: 14,
      icon: "📷",
    },
    {
      id: "group-9",
      name: "Constitución Board Gamers",
      coordinates: [-58.3847, -34.6297],
      radius: 1,
      location: "Constitución, Buenos Aires",
      description: "Board game nights every Friday.",
      membersCount: 11,
      icon: "🎲",
    },
    {
      id: "group-10",
      name: "Parque Patricios Techies",
      coordinates: [-58.4032, -34.6345],
      radius: 2,
      location: "Parque Patricios, Buenos Aires",
      description: "Tech meetups and coding sessions.",
      membersCount: 25,
      icon: "💻",
    },
    {
      id: "group-11",
      name: "Saavedra Dog Walkers",
      coordinates: [-58.4897, -34.5556],
      radius: 1.3,
      location: "Saavedra, Buenos Aires",
      description: "Group dog walks in Parque Saavedra.",
      membersCount: 16,
      icon: "🐕",
    },
  ]

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
