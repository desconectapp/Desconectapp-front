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

const mockGroups = [
  { id: "1", name: "Fútbol lunes", lastMessage: "¿Quién va hoy?" },
  { id: "2", name: "Yoga en el parque", lastMessage: "Clase cancelada por lluvia" },
  { id: "3", name: "Gimnasio 18hs", lastMessage: "Hoy hacemos piernas 💪" },
]

const mockSugerencias = [
  { id: "4", name: "Ciclismo matutino", lastMessage: "¿Alguien se suma?" },
  { id: "5", name: "Natación nocturna", lastMessage: "Piscina abierta hasta tarde" },
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

      <Text text="Sugerencias" preset="heading" style={$subtitle}>
        Quizas tamibien te interese...
      </Text>
      <FlatList
        data={mockSugerencias}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
      />
    </Screen>
  )
})

const $container = { padding: 20 }
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
