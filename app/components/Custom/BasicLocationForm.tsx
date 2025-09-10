import React, { useState } from "react"
import { View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform } from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"

export default function BasicLocationForm() {
  const { theme } = useAppTheme()
  const styles = createThemedStyles(theme)
  const fetchLocalidades = async (query: string) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&accept-language=es&countrycodes=ar&addressdetails=1&limit=5`

    const res = await fetch(url, {
      headers: { "User-Agent": "tu-app-ejemplo" },
    })

    return await res.json()
  }

  const [query, setQuery] = useState("")
  const [sugerencias, setSugerencias] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("")

  const handleSearch = async (text: string) => {
    setQuery(text)
    if (text.length < 3) {
      setSugerencias([])
      return
    }
    try {
      const data = await fetchLocalidades(text)
      setSugerencias(data)
    } catch (error) {
      console.error("Error fetching locations:", error)
      setSugerencias([])
    }
  }

  const handleSelect = (item: any) => {
    setSugerencias([])
    setQuery(item.display_name)
    setSelectedLocation(item.display_name)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.searchSection}>
          <TextInput
            placeholder="Buscar localidad"
            value={query}
            onChangeText={handleSearch}
            style={styles.input}
          />
          {sugerencias.length > 0 && (
            <View style={styles.suggestionsList}>
              {sugerencias.map((item) => (
                <TouchableOpacity 
                  key={item.place_id.toString()}
                  onPress={() => handleSelect(item)} 
                  style={styles.suggestion}
                >
                  <Text style={styles.suggestionText}>{item.display_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {selectedLocation !== "" && (
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedLabel}>Ubicación seleccionada:</Text>
              <Text style={styles.selectedText}>{selectedLocation}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.mapPlaceholder}>
          <Text style={styles.placeholderText}>
            🗺️ Mapa será mostrado aquí
          </Text>
          <Text style={styles.placeholderSubtext}>
            {selectedLocation || "Selecciona una ubicación para ver en el mapa"}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

// Create theme-aware styles
const createThemedStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    padding: 8,
    backgroundColor: theme.colors.background,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.background,
  },
  suggestionsList: {
    maxHeight: 150,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    backgroundColor: theme.colors.background,
  },
  suggestion: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  selectedContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: theme.colors.backgroundMuted,
    borderRadius: 4,
  },
  selectedLabel: {
    fontWeight: "bold",
    marginBottom: 4,
    color: theme.colors.text,
  },
  selectedText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  mapPlaceholder: {
    flex: 1,
    minHeight: 300,
    backgroundColor: theme.colors.backgroundMuted,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
  },
  placeholderText: {
    fontSize: 24,
    marginBottom: 8,
    color: theme.colors.text,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 20,
  },
})
