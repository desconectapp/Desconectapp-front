import React, { useState, useRef, useEffect, useCallback } from "react"
import { Screen } from "../components/Screen"
import { Text } from "../components/Text"
import { Button } from "../components/Button"
import { TextField } from "../components/TextField"
import { 
  View, 
  StyleSheet, 
  Platform, 
  TouchableOpacity, 
  Modal, 
  Animated,
  Dimensions,
  FlatList,
  ListRenderItem,
  TextInput,
  Alert,
  ScrollView
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "@/navigators"
import { useActivities } from "@/hooks/Users"
import { ActivitiesForm } from "@/components/Custom/ActivitiesForm"
import { TimePickerForm } from "@/components/Custom/TimePickerForm"
import LocationForm from "@/components/Custom/LocationForm"
import MapView from "react-native-maps"
import { useStores } from "@/models"
import { containers, buttons, buttonTexts, texts, inputs, chips, separators } from "@/theme/commonStyles"
import { CustomSlider } from "@/components"
import { Activity } from "@/services/activities/Activities.types"

const { width } = Dimensions.get('window')

export function SearchScreen() {
  const { themed, theme } = useAppTheme()
  const { requestStore } = useStores()
  const navigation = useNavigation<AppStackScreenProps<"Main">["navigation"]>()
  
  // Activities state
  const [allActivities, setAllActivities] = useState<Activity[]>([])
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Participants state
  const [minParticipants, setMinParticipants] = useState(3)
  const [maxParticipants, setMaxParticipants] = useState(5)
  
  // Activities API
  const limit = 20
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const { data, isLoading, isError, isFetching } = useActivities(limit, offset)
  
  useEffect(() => {
    if (isError) {
      console.error("Error loading activities")
      return
    }
    
    if (data && data.length > 0) {
      setAllActivities((prev) => {
        const existingIds = new Set(prev.map(item => item.id))
        const newItems = data.filter(item => !existingIds.has(item.id))
        return [...prev, ...newItems]
      })
      if (data.length < limit) {
        setHasMore(false)
      }
    } else if (data && data.length === 0) {
      setHasMore(false)
    }
  }, [data, isError])

  const loadMoreActivities = () => {
    if (!isFetching && !isLoading && hasMore && !isError) {
      setOffset((prev) => prev + limit)
    }
  }

  // Filter activities based on search query
  const filteredActivities = allActivities.filter(activity =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity)
  }

  const handleMinParticipantsChange = (value: number) => {
    setMinParticipants(value)
    if (maxParticipants <= value) {
      setMaxParticipants(value + 1 <= 10 ? value + 1 : 10)
    }
  }

  const handleMaxParticipantsChange = (value: number) => {
    setMaxParticipants(value)
    if (minParticipants > value) {
      setMinParticipants(value - 1 >= 3 ? value - 1 : 3)
    }
  }

  const handleSearch = () => {
    if (!selectedActivity) {
      Alert.alert("Error", "Por favor selecciona una actividad")
      return
    }

    try {
      // Save to store
      requestStore.setActivity(selectedActivity)
      requestStore.setMinParticipants(minParticipants)
      requestStore.setMaxParticipants(maxParticipants)
      
      // Navigate to location picker
      navigation.navigate("LocationPickerScreen" as any)
    } catch (error) {
      console.error("Error starting search:", error)
      Alert.alert("Error", "Hubo un problema al iniciar la búsqueda")
    }
  }

  const renderActivityItem: ListRenderItem<Activity> = ({ item }) => {
    const isSelected = selectedActivity?.id === item.id
    
    return (
      <TouchableOpacity
        style={[
          themed(chips.base),
          themed(isSelected ? chips.selected : chips.unselected),
          styles.activityChip
        ]}
        onPress={() => handleActivitySelect(item)}
      >
        <Text style={[
          themed(chips.text),
          themed(isSelected ? chips.textSelected : chips.textUnselected)
        ]}>
          {item.icon} {item.name}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <Screen
      preset="auto"
      contentContainerStyle={[containers.screen, styles.container]}
      backgroundColor={themed(() => theme.colors.background)}
    >
      {/* Header */}
      <Text preset="heading" style={[themed(texts.heading), styles.title]}>
        ¿Qué quieres hacer? 🎯
      </Text>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <Text style={[themed(texts.label), styles.sectionTitle]}>
          Buscar actividad
        </Text>
        <TextInput
          style={[themed(inputs.base), themed(inputs.text)]}
          placeholder="Buscar actividades..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.textDim}
        />
      </View>

      {/* Activities Carousel */}
      <View style={styles.activitiesSection}>
        <Text style={[themed(texts.label), styles.sectionTitle]}>
          Actividades
        </Text>

        <View style={styles.carouselContainer}>
            {isLoading && allActivities.length === 0 ? (
              <View style={[containers.centered, styles.loadingContainer]}>
                <Text style={themed(texts.bodySmall)}>Cargando actividades...</Text>
              </View>
            ) : isError ? (
              <View style={[containers.centered, styles.loadingContainer]}>
                <Text style={themed(texts.error)}>Error al cargar actividades</Text>
              </View>
            ) : (
              <View style={{ position: 'relative' }}>
                <FlatList
                  data={filteredActivities}
                  renderItem={renderActivityItem}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carouselContent}
                  onEndReached={loadMoreActivities}
                  onEndReachedThreshold={0.8}
                  ListEmptyComponent={
                    searchQuery ? (
                      <View style={[containers.centered, styles.emptyContainer]}>
                        <Text style={themed(texts.bodySmall)}>
                          No se encontró "{searchQuery}"
                        </Text>
                        <TouchableOpacity
                          style={[themed(buttons.secondary), styles.suggestButton]}
                          onPress={() => {
                            const customActivityObj: Activity = {
                              id: -1,
                              name: searchQuery.trim(),
                              icon: "✨"
                            }
                            setSelectedActivity(customActivityObj)
                            setSearchQuery("")
                          }}
                        >
                          <Text style={themed(buttonTexts.secondary)}>
                            ✨ Agregar "{searchQuery}" como actividad
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={[containers.centered, styles.emptyContainer]}>
                        <Text style={themed(texts.bodySmall)}>
                          No hay actividades disponibles
                        </Text>
                      </View>
                    )
                  }
                />
                {filteredActivities.length > 3 && (
                  <View style={styles.scrollHintContainer}>
                    <Text style={[themed(texts.caption), styles.scrollHint]}>
                      ➡️ Desliza para ver más
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

        {/* Selected Activity Display */}
        {selectedActivity && (
          <View style={[themed(containers.card), styles.selectedActivityCard]}>
            <Text style={[themed(texts.title), styles.selectedActivityText]}>
              {selectedActivity.icon} {selectedActivity.name}
            </Text>
          </View>
        )}
      </View>

      {/* Participants Section */}
      <View style={styles.participantsSection}>
        <Text style={[themed(texts.label), styles.sectionTitle]}>
          Participantes ({minParticipants}-{maxParticipants}) {'🙂'.repeat(minParticipants)} 
          {'🫥'.repeat(Math.max(0, maxParticipants - minParticipants))}
        </Text>
      
        
        <View style={styles.participantsRow}>
          <View style={styles.sliderWrapper}>
            <CustomSlider
              label="Min"
              value={minParticipants}
              min={3}
              max={10}
              step={1}
              onValueChange={handleMinParticipantsChange}
              formatValue={(value) => `${value}`}
              showButtons={false}
            />
          </View>

          <View style={styles.sliderWrapper}>
            <CustomSlider
              label="Max"
              value={maxParticipants}
              min={3}
              max={10}
              step={1}
              onValueChange={handleMaxParticipantsChange}
              formatValue={(value) => `${value}`}
              showButtons={false}
            />
          </View>
        </View>
      </View>

      {/* Next Button */}
      <Button
        text="Siguiente"
        style={[
          themed(buttons.primary),
          styles.searchButton,
          !selectedActivity && themed(buttons.primaryDisabled)
        ]}
        textStyle={[
          themed(buttonTexts.primary),
          !selectedActivity && themed(buttonTexts.primaryDisabled)
        ]}
        disabled={!selectedActivity}
        onPress={handleSearch}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  searchSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 6,
  },
  activitiesSection: {
    marginBottom: 16,
  },
  customActivityContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  customInput: {
    flex: 1,
  },
  addButton: {
    paddingHorizontal: 20,
    minWidth: 100,
  },
  carouselContainer: {
    marginTop: 8,
  },
  carouselContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  activityChip: {
    marginRight: 12,
    minWidth: 120,
  },
  loadingContainer: {
    paddingVertical: 20,
  },
  emptyContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  suggestButton: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  selectedActivityCard: {
    marginTop: 8,
    paddingVertical: 8,
  },
  selectedActivityText: {
    textAlign: "center",
  },
  participantsSection: {
    marginBottom: 16,
  },
  participantsVisual: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 8,
  },
  participantsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  sliderWrapper: {
    flex: 1,
  },
  searchButton: {
    marginTop: 8,
  },
  activitiesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  scrollHint: {
    fontSize: 12,
    opacity: 0.7,
  },
  scrollHintContainer: {
    position: "absolute",
    bottom: -20,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
})