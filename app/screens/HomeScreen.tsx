import { observer } from "mobx-react-lite"
import { useState } from "react"
import { View, type ViewStyle, type TextStyle, TouchableOpacity } from "react-native"
import { Screen, TextField, Button, Text, AutoImage } from "@/components"
import type { AppStackScreenProps } from "../navigators"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useForm, Controller } from "react-hook-form"
import { useNavigation } from "@react-navigation/native"
import { FlatList, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import Animated from "react-native-reanimated"
import caminata from "../../assets/images/caminata.jpeg"

import { PhotoGallerySlider, PhotoItem } from "@/components/Custom/PhotoGallerySlider"

const mockGroups = [
  { id: "1", name: "Fútbol lunes", lastMessage: "¿Quién va hoy?" },
  { id: "2", name: "Yoga en el parque", lastMessage: "Clase cancelada por lluvia" },
  { id: "3", name: "Gimnasio 18hs", lastMessage: "Hoy hacemos piernas 💪" },
]

const mockSuggestions: PhotoItem[] = [
  { id: "1", image: caminata, title: "Caminata al Atardecer", subtitle: "Palermo, Buenos Aires" },
  { id: "2", image: caminata, title: "Paseo con Perrito", subtitle: "Parque Centenario" },
  { id: "3", image: caminata, title: "Feria Artesanal", subtitle: "Plaza Francia, Recoleta" },
  { id: "4", image: caminata, title: "Tarde de Mate", subtitle: "Costanera Sur" },
  { id: "5", image: caminata, title: "Clases de Tango", subtitle: "San Telmo" },
  { id: "6", image: caminata, title: "Picnic en el Parque", subtitle: "Bosques de Palermo" },
  { id: "7", image: caminata, title: "Salida Fotográfica", subtitle: "Puerto Madero" },
  { id: "8", image: caminata, title: "Feria de Mataderos", subtitle: "Tradiciones Argentinas" },
]

export const HomeScreen = observer(function HomeScreen() {
  const navigation = useNavigation<AppStackScreenProps<"HomeScreen">["navigation"]>()

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate("GroupScreen", { groupId: item.id })
      }}
    >
      <View style={styles.avatar}>
        <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
      </View>
      <View style={styles.textContainer}>
        <Text text={item.name} preset="subheading" style={styles.name} />
        <Text text={item.lastMessage} size="sm" numberOfLines={1} style={styles.message} />
      </View>
    </TouchableOpacity>
  )

  return (
    <Screen preset="fixed" style={$container}>
      <Text text="Mis grupos" preset="heading" style={$heading} />
      <FlatList
        data={mockGroups}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
      />

      <PhotoGallerySlider data={mockSuggestions} title="Sugerencias" />
    </Screen>
  )
})

const $container = { padding: 10 }
const $heading = { marginBottom: 16 }
const $subtitle = { marginBottom: 8 }

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: "#4c8bf5",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginRight: 16,
    width: 48,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 3,
    flexDirection: "row",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  message: {
    color: "#555",
  },
  name: {
    fontWeight: "600",
    marginBottom: 4,
  },
  textContainer: {
    flex: 1,
  },
})
