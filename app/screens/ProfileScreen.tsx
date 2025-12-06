"use client"

import { observer } from "mobx-react-lite"
import { useEffect, useRef, useState, useCallback } from "react"
import {
  View,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
  ScrollView,
} from "react-native"
import { Screen, TextField, Button, Text, AutoImage } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useForm, Controller } from "react-hook-form"
import { useAppToast } from "@/components/useToast"
import { chatsService } from "@/services/chat"
import { userService } from "@/services/users/UserApi"
import { spacing } from "@/theme"
import useImagePicker from "@/hooks/Image"
import { useNavigation } from "@react-navigation/native"
import { useQueryClient } from "@tanstack/react-query"

import type { AppStackScreenProps } from "@/navigators"

import { useStores } from "@/models"
import { Pressable } from "react-native"
import { useUploadProfileImage } from "@/hooks/Chats"
import {
  useAddPreferencesBatch,
  useEditProfile,
  useProfile,
  useActivities,
  useUserPreferences,
} from "@/hooks/Users"

const defaultAvatar = require("../../assets/images/default-avatar.png")

const { width, height } = Dimensions.get("window")

interface ProfileFormData {
  name: string
  location: string
}

// UPDATED HELPER FUNCTION TO RENDER PREFERENCE CHIP FOR PROFILE SCREEN
const renderPreferenceChip = (
  item: { id: number | string; name: string; icon: string },
  theme: any,
  themed: (style: any) => any,
) => {
  return (
    <View
      key={item.id}
      style={[
        $chip,
        themed($chipSelected),
        // FIX: Removed complex layout properties (flex, minWidth, marginRight) from the chip itself.
        { flex: 0, marginBottom: spacing.sm, marginHorizontal: spacing.xs / 2 },
      ]}
    >
      <Text style={$emoji}>{item.icon}</Text>
      <Text style={themed($chipTextSelected)}>{item.name}</Text>
    </View>
  )
}
// END UPDATED HELPER FUNCTION

// NEW HELPER FUNCTION: Renders the chip list for the read-only modal
const renderReadOnlyPreferenceChip = ({ item }: { item: { id: number | string; name: string; icon: string } }, theme: any, themed: (style: any) => any) => {
    return (
        <View style={{ width: '50%' }}> 
            <View
                key={item.id}
                style={[
                    $chip,
                    themed($chipSelected),
                    // Read-only style for chips
                    { flex: 0, marginBottom: spacing.sm, marginHorizontal: spacing.xs / 2, backgroundColor: theme.colors.palette.neutral300 },
                ]}
            >
                <Text style={$emoji}>{item.icon}</Text>
                <Text style={themed({ color: theme.colors.text })}>{item.name}</Text>
            </View>
        </View>
    )
}
// END NEW HELPER FUNCTION

export const ProfileScreen = observer(function ProfileScreen() {
  const { themed, theme } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [showAllPreferencesModal, setShowAllPreferencesModal] = useState(false) // NEW STATE FOR "VER TODO"

  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()
  const { showToast } = useAppToast()
  const queryClient = useQueryClient()

  const { data: profile } = useProfile()
  const { imageUri, handleImagePicker } = useImagePicker()
  const { mutateAsync: editProfileMutateAsync } = useEditProfile()
  const addPreferences = useAddPreferencesBatch()
  const { sessionStore } = useStores()

  const [selectedPreferences, setSelectedPreferences] = useState<(number | string)[]>([])
  const [allPreferences, setAllPreferences] = useState<any[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 10
  const [query, setQuery] = useState("")
  const prevQuery = useRef("")
  const [allCustomPreferences, setAllCustomPreferences] = useState<
    { id: string; name: string; icon: string }[]
  >([])

  const { data: prefsData, isFetching } = useActivities(limit, offset, query)
  const { data: userPreferencesData } = useUserPreferences()

  const { isPending: isUploadingImage, mutateAsync: uploadProfilePictureAsync } =
    useUploadProfileImage()

  useEffect(() => {
    if (userPreferencesData && showPreferencesModal) {
      const ids = userPreferencesData?.preferences?.map((p: any) => p.id) || []

      setSelectedPreferences(ids)
      setAllPreferences((prev) => [
        ...userPreferencesData.preferences,
        ...prev.filter((p) => !ids.includes(p.id)),
      ])
      setAllCustomPreferences([])
      setQuery("")
    }
  }, [userPreferencesData, showPreferencesModal])

  useEffect(() => {
    if (query !== prevQuery.current) {
      prevQuery.current = query

      if (prefsData) {
        setAllPreferences((_prev) => prefsData)
        setHasMore(prefsData.length >= limit)
        setOffset(prefsData.length)
      } else {
        setHasMore(false)
        setAllPreferences([])
      }

      return
    }

    if (prefsData && prefsData.length > 0) {
      setAllPreferences((prev) => [...prev, ...prefsData])
      if (prefsData.length < limit) setHasMore(false)
    } else if (prefsData && prefsData.length === 0) {
      setHasMore(false)
    }
  }, [prefsData, query, limit])

  const handleEndReached = useCallback(() => {
    if (!isFetching && hasMore) {
      setOffset((prev) => prev + limit)
    }
  }, [isFetching, hasMore, limit])

  const togglePreference = useCallback((id: number | string) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }, [])

  const handleSelectCustomPreference = () => {
    const activityName = query.trim()
    if (!activityName) return

    const customPrefObj = {
      id: activityName, // Use the name as the unique string ID
      name: activityName,
      icon: "✨",
    }

    setAllCustomPreferences((prev) => {
      if (!prev.find((p) => p.id === activityName)) {
        return [...prev, customPrefObj]
      }
      return prev
    })

    setSelectedPreferences((prev) => {
      if (!prev.includes(activityName)) {
        return [...prev, activityName]
      }
      return prev
    })

    setQuery("")
  }

  const handleSavePreferences = async () => {
    try {
      const existingActivityIds = selectedPreferences.filter(
        (id) => typeof id === "number",
      ) as number[]
      const customActivityNames = selectedPreferences.filter(
        (id) => typeof id === "string",
      ) as string[]

      const payload: {
        activity_ids: number[]
        custom_activities: string[]
      } = {
        activity_ids: existingActivityIds,
        custom_activities: customActivityNames.length > 0 ? customActivityNames : [],
      }

      await addPreferences.mutateAsync(payload)

      showToast("Preferencias Actualizadas", "Tus preferencias se guardaron exitosamente")
      setShowPreferencesModal(false)

      setAllCustomPreferences([])
      setQuery("")
    } catch (err) {
      console.error(err)
      showToast("Error", "No se pudieron guardar las preferencias")
    }
  }

  // This function renders a horizontal list of selected custom activities (in Modal)
  const renderSelectedCustomActivities = () => {
    // Filter selectedPreferences for custom activities (string IDs)
    const selectedCustomNames = selectedPreferences.filter(
      (id) => typeof id === "string",
    ) as string[]

    // Get the details from allCustomPreferences
    const selectedCustomActivities = allCustomPreferences.filter((p) =>
      selectedCustomNames.includes(p.id),
    )

    if (selectedCustomActivities.length === 0) return null

    return (
      <View style={{ marginBottom: spacing.md, paddingHorizontal: spacing.xs }}>
        <Text style={createModalStyles(theme).modalSectionTitle}>Preferencias Personalizadas</Text>
        <FlatList
          data={selectedCustomActivities}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => togglePreference(item.id)}
                style={[
                  $chip,
                  themed($chipSelected),
                  { flex: 0, marginRight: spacing.md, minWidth: 100 },
                ]}
              >
                <Text style={$emoji}>{item.icon}</Text>
                <Text style={themed($chipTextSelected)}>{item.name}</Text>
                <Text style={themed($chipTextSelected)}> (x)</Text>
              </TouchableOpacity>
            )
          }}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.xs / 2 }}
        />
      </View>
    )
  }

  const renderCustomPreferenceSuggestion = () => {
    const activityName = query.trim()
    if (
      !activityName ||
      isFetching ||
      allPreferences.length > 0 ||
      (prefsData && prefsData.length > 0)
    ) {
      return null
    }

    const isCustomSelected = selectedPreferences.includes(activityName)

    return (
      <TouchableOpacity
        onPress={handleSelectCustomPreference}
        style={[
          $chip,
          themed(isCustomSelected ? $chipSelected : $chipUnselected),
          // Use full width for suggestion chip
          {
            flex: 0,
            width: width * 0.9 - spacing.lg * 2,
            marginVertical: spacing.md,
            alignSelf: "center",
          },
        ]}
      >
        <Text style={$emoji}>✨</Text>
        <Text style={themed(isCustomSelected ? $chipTextSelected : $chipTextUnselected)}>
          ✨ Agregar "{activityName}" como preferencia
        </Text>
      </TouchableOpacity>
    )
  }

  const renderItem = ({ item }: any) => {
    const selected = selectedPreferences.includes(item.id)
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => togglePreference(item.id)}
        style={[$chip, themed(selected ? $chipSelected : $chipUnselected)]}
      >
        <Text style={$emoji}>{item.icon}</Text>
        <Text style={themed(selected ? $chipTextSelected : $chipTextUnselected)}>{item.name}</Text>
      </TouchableOpacity>
    )
  }

  const renderProfilePreferences = () => {
    const allPreferences = userPreferencesData?.preferences || []
    
    const preferences = allPreferences.slice(0, 4); 

    if (preferences.length === 0) {
      return (
        <View style={$preferencesSection}>
          <Text style={themed($noPreferencesText)}>
            Aún no has agregado preferencias. ¡Edítalas para empezar a conectar!
          </Text>
        </View>
      )
    }

    return (
      <View style={$preferencesSection}>
        {/* Title removed for fixed header */}
        {/* FIX: Using a standard View with flexWrap and map for the two-column layout */}
        <View style={[$preferencesListContainer, { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -spacing.xs / 2 }]}>
          {preferences.map((item: any) => (
            <View 
              key={item.id.toString()}
              style={{ width: '50%' }} // Explicitly setting 50% width for two columns
            >
              {renderPreferenceChip(item, theme, themed)}
            </View>
          ))}
        </View>
      </View>
    )
  }
  // END RENDER FUNCTION

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: profile?.name || "",
      location: profile?.city || "",
    },
    values: {
      name: profile?.name || "",
      location: profile?.city || "",
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      let url
      if (imageUri) {
        console.log("Uploading image:", imageUri, "for user:", sessionStore.user_uuid)
        if (sessionStore.user_uuid != null) {
          url = await uploadProfilePictureAsync({ userId: sessionStore.user_uuid, uri: imageUri })
        } else {
          console.warn("No user ID available for image upload")
        }
      }

      console.log("Updating profile with data:", data, "and image URL:", url)

      await editProfileMutateAsync({
        ...profile,
        ...data,
        avatar_url: url || profile?.avatar_url,
      })

      showToast("Perfil Actualizado", "Tu perfil se actualizó exitosamente")
      setIsEditing(false)
      reset(data)
    } catch (error) {
      console.error("Error updating profile:", error)
      showToast("Error al Actualizar", "Hubo un error al actualizar tu perfil")
    } finally {
      setIsSaving(false)
    }
  }

  const logOut = async () => {
    try {
      await userService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      sessionStore.setSession(null)
      navigation.navigate("LoginScreen")
    }
  }

  const onCancel = () => {
    reset()
    setIsEditing(false)
  }

  const hasMorePreferences = (userPreferencesData?.preferences?.length || 0) > 4;

  return (
    // FIX: Using View with flex: 1 for the main screen container
    <View style={[$screenBackground(theme), { flex: 1 }]}>
        
        {/* === FIXED HEADER/PROFILE SECTION === */}
        <View style={$fixedHeaderContainer}> 
            <Text preset="heading" style={themed({ fontSize: 24, fontWeight: "bold" })}>
                Mi perfil
            </Text>

            <Pressable
                style={themed($profileCard)}
                onPress={() => setIsEditing(true)}
                disabled={isEditing}
                android_ripple={{ borderless: false }}
            >
                <View style={$profileContent}>
                    <View style={$profileImageSection}>
                        <View style={$imageWrapper}>
                            <AutoImage
                                source={
                                    imageUri || profile?.avatar_url
                                        ? { uri: imageUri ?? profile?.avatar_url }
                                        : defaultAvatar
                                }
                                style={$profileImage}
                                resizeMode="cover"
                            />
                            {isEditing && (
                                <TouchableOpacity
                                    style={themed($imageEditOverlay)}
                                    onPress={handleImagePicker}
                                    activeOpacity={0.8}
                                >
                                    <View style={themed($imageEditButton)}>
                                        <Text style={themed($imageEditText)}>✏️</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={$profileInfoSection}>
                        <Controller
                            control={control}
                            name="name"
                            rules={{
                                required: "El nombre es requerido",
                                minLength: { value: 2, message: "El nombre debe tener al menos 2 letras" },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <View style={$fieldContainer}>
                                    {isEditing ? (
                                        <TextField
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="Ingresa tu nombre"
                                            helper={errors.name?.message}
                                            status={errors.name ? "error" : undefined}
                                            autoCapitalize="words"
                                            style={$editInput}
                                        />
                                    ) : (
                                        <Text style={themed($displayName)}>{value || "Tu Nombre"}</Text>
                                    )}
                                </View>
                            )}
                        />

                        <Controller
                            control={control}
                            name="location"
                            rules={{
                                required: "La ubicación es requerida",
                                minLength: { value: 2, message: "Por favor ingresa una ubicación válida" },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <View style={$fieldContainer}>
                                    {isEditing ? (
                                        <TextField
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="Ciudad, País"
                                            helper={errors.location?.message}
                                            status={errors.location ? "error" : undefined}
                                            autoCapitalize="words"
                                            style={$editInput}
                                        />
                                    ) : (
                                        <Text style={themed($displayLocation)}>{value || "Tu Ubicación"}</Text>
                                    )}
                                </View>
                            )}
                        />
                    </View>
                </View>

                {isEditing && (
                    <View style={$buttonContainer}>
                        <Button
                            text={isSaving ? "Guardando..." : "Guardar Cambios"}
                            onPress={handleSubmit(onSubmit)}
                            style={themed($saveButton)}
                            textStyle={themed($saveButtonText)}
                            loading={isSaving}
                            disabled={isUploadingImage || isSaving || (!isDirty && imageUri === null)}
                        />

                        <Button
                            text={"Cancelar"}
                            onPress={onCancel}
                            style={themed($cancelButton)}
                            textStyle={themed($cancelButtonText)}
                        />
                    </View>
                )}
            </Pressable>
        </View>

        {/* --- INTERESTS TITLE & SEE ALL BUTTON (Fixed) --- */}
        <View style={themed($fixedInterestsTitleContainer)}>
            <Text style={themed($preferencesTitle)}>Intereses</Text>
            {hasMorePreferences && (
                <TouchableOpacity onPress={() => setShowAllPreferencesModal(true)} style={$seeAllButton}>
                    <Text style={themed($seeAllText)}>Ver Todo</Text>
                </TouchableOpacity>
            )}
        </View>

        {/* --- SCROLLABLE CONTENT (Interests + Action Buttons) --- */}
        <ScrollView 
            style={themed($scrollableInterests)} 
            contentContainerStyle={{ paddingBottom: 0 }}
        >
            <View style={{ paddingHorizontal: spacing.lg }}>
                {renderProfilePreferences()}
            </View>

            <View style={$buttonsBelowInterests}>
                <Pressable
                    onPress={() => setShowPreferencesModal(true)}
                    style={({ pressed }) => [
                        themed($editPreferencesButton),
                        {
                            width: "100%",
                            backgroundColor: pressed
                                ? theme.colors.separator
                                : themed($editPreferencesButton).backgroundColor,
                        },
                    ]}
                >
                    <Text style={themed($settingsButtonText)}>{"Editar Preferencias"}</Text>
                </Pressable>

                <Pressable
                    onPress={() => logOut()}
                    style={({ pressed }) => [
                        themed($settingsButton),
                        {
                            width: "100%",
                            backgroundColor: pressed ? "#8B0000" : themed($settingsButton).backgroundColor,
                        },
                    ]}
                >
                    <Text style={themed($settingsButtonText)}>{"Cerrar Sesión"}</Text>
                </Pressable>
            </View>
        </ScrollView>

        {/* --- SAFETY AREA FOOTER --- */}
        <View style={[$fixedFooterContainer, themed($screenBackground), $bottomContainerInsets]} />

      {/* ======================================= */}
      {/* 1. MODAL FOR EDITING/SEARCHING PREFERENCES */}
      {/* ======================================= */}
      <Modal
        visible={showPreferencesModal}
        onRequestClose={() => setShowPreferencesModal(false)}
        {...modalAnimationConfig}
      >
        <View style={createModalStyles(theme).modalOverlay}>
          <View style={createModalStyles(theme).modalContainer}>
            <View style={createModalStyles(theme).modalHeader}>
              <Text style={createModalStyles(theme).modalTitle}>Seleccionar Preferencias</Text>
              <TouchableOpacity
                onPress={() => setShowPreferencesModal(false)}
                style={createModalStyles(theme).modalCloseButton}
              >
                <Text style={createModalStyles(theme).modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <TextField
              value={query}
              style={createModalStyles(theme).modalSearchInput}
              containerStyle={createModalStyles(theme).modalSearchInputContainer}
              onChangeText={(text) => {
                setOffset(0)
                setQuery(text)
              }}
              placeholder="Buscar preferencias..."
              autoCapitalize="none"
            />

            {/* Render the horizontal list of selected custom activities */}
            {renderSelectedCustomActivities()}

            {/* Render the suggestion to add a new custom preference */}
            {renderCustomPreferenceSuggestion()}

            <FlatList
              data={allPreferences}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={{ paddingBottom: spacing.lg }}
              onEndReached={() => {
                handleEndReached()
              }}
              onEndReachedThreshold={0.6}
            />

            <View style={createModalStyles(theme).modalFooter}>
              <TouchableOpacity
                style={createModalStyles(theme).modalSecondaryButton}
                onPress={() => setShowPreferencesModal(false)}
              >
                <Text style={createModalStyles(theme).modalSecondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={createModalStyles(theme).modalPrimaryButton}
                onPress={handleSavePreferences}
              >
                <Text style={createModalStyles(theme).modalPrimaryButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================= */}
      {/* 2. NEW MODAL FOR VIEWING ALL USER PREFERENCES */}
      {/* ======================================= */}
      <Modal
        visible={showAllPreferencesModal}
        onRequestClose={() => setShowAllPreferencesModal(false)}
        {...modalAnimationConfig}
      >
        <View style={createModalStyles(theme).modalOverlay}>
            <View style={createModalStyles(theme).modalContainer}>
                <View style={createModalStyles(theme).modalHeader}>
                    <Text style={createModalStyles(theme).modalTitle}>Todas Mis Preferencias</Text>
                    <TouchableOpacity
                        onPress={() => setShowAllPreferencesModal(false)}
                        style={createModalStyles(theme).modalCloseButton}
                    >
                        <Text style={createModalStyles(theme).modalCloseText}>×</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={userPreferencesData?.preferences || []}
                    renderItem={(props) => renderReadOnlyPreferenceChip(props, theme, themed)}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={{ paddingBottom: spacing.lg }}
                    ListEmptyComponent={() => (
                        <Text style={{ textAlign: 'center', color: theme.colors.textDim, marginTop: spacing.lg }}>
                            No tienes preferencias guardadas.
                        </Text>
                    )}
                />
            </View>
        </View>
      </Modal>

    </View>
  )
})

const $chip: ViewStyle = {
  borderRadius: 25,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  marginHorizontal: spacing.xs / 2,
  alignItems: "center",
  marginBottom: spacing.md,
}

const $chipSelected = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  borderColor: theme.colors.tint,
  borderWidth: 2,
})

const $chipUnselected = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.backgroundMuted,
  borderColor: theme.colors.border,
  borderWidth: 2,
})

const $chipTextSelected = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontWeight: "600",
  textAlign: "center",
})

const $chipTextUnselected = (theme: any): TextStyle => ({
  color: theme.colors.text,
  fontWeight: "600",
  textAlign: "center",
})

const $emoji: TextStyle = {
  fontSize: 26,
  lineHeight: 32,
  marginBottom: 4,
}

const $container: ViewStyle = {
  // This style is now largely unused or its properties are moved to the fixed containers
}

const $screenBackground = (theme: any) => ({
  backgroundColor: theme.colors.background,
})

const $settingsButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.palette.neutral200,
  minHeight: 50,
  borderRadius: spacing.md,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: theme.colors.border,
})

const $settingsButtonText = (theme: any): TextStyle => ({
  fontSize: 18,
})

const $profileCard = (theme: any): ViewStyle => ({
  marginTop: spacing.md,

  backgroundColor: theme.colors.palette.neutral200,
  borderRadius: spacing.lg,
  padding: spacing.lg,
  marginBottom: spacing.xl,
  // shadowColor: theme.colors.palette.neutral900,
  // shadowOffset: {
  //   width: 0,
  //   height: 2,
  // },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
  borderWidth: 1,
  borderColor: theme.colors.border,
})

const $profileContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
}

const $profileImageSection: ViewStyle = {
  marginRight: spacing.lg,
}

const $imageWrapper: ViewStyle = {
  position: "relative",
}

const $profileImage: ImageStyle = {
  width: 80,
  height: 80,
  borderRadius: 40,
  borderWidth: 3,
  borderColor: "#ffffff",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
}

const $imageEditOverlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 40,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  justifyContent: "center",
  alignItems: "center",
}

const $imageEditButton = (theme: any): ViewStyle => ({
  backgroundColor: "transparent",
})

const $imageEditText = (theme: any): TextStyle => ({
  fontSize: 20,
})

const $profileInfoSection: ViewStyle = {
  flex: 1,
  justifyContent: "center",
}

const $fieldContainer: ViewStyle = {
  marginBottom: spacing.md,
}

const $displayName = (theme: any): TextStyle => ({
  fontSize: 24,
  fontWeight: "bold",
  color: theme.colors.text,
  marginBottom: spacing.xs,
})

const $displayLocation = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.textDim,
  fontWeight: "500",
})

const $editInput: ViewStyle = {
  marginBottom: 0,
}

const $buttonContainer: ViewStyle = {
  marginTop: spacing.sm,
  gap: spacing.md,
}

const $saveButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  marginBottom: 8,
  borderRadius: 20,
  justifyContent: "center",
  alignItems: "center",
})

const $editPreferencesButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  marginBottom: spacing.md,
  minHeight: 50,
  borderRadius: spacing.md,
  justifyContent: "center",
  alignItems: "center",
})

const $saveButtonText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontWeight: "600",
  fontSize: 14,
})

const $cancelButton = (theme: any): ViewStyle => ({
  backgroundColor: "transparent",
  borderWidth: 1.5,
  borderColor: theme.colors.border,
  minHeight: 50,
  borderRadius: spacing.md,
})

const $cancelButtonText = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  fontWeight: "600",
  fontSize: 14,
})

// NEW/UPDATED STYLES
const $preferencesSection: ViewStyle = {
  marginBottom: spacing.xl,
}

const $preferencesTitle = (theme: any): TextStyle => ({
  fontSize: 18,
  fontWeight: "bold",
  color: theme.colors.text,
})

// FIX: New style for the fixed top section
const $fixedHeaderContainer: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xs, // Small separator space
}

// FIX: New style for the fixed Intereses Title container
const $fixedInterestsTitleContainer = (theme: any): ViewStyle => ({
    flexDirection: 'row',
    justifyContent: 'space-between', // Aligns title left, button right
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md, // Margin below the title
    backgroundColor: theme.colors.background, // Ensure title covers scroll
})

// FIX: Style for the fixed bottom section (now only for safe area)
const $fixedFooterContainer: ViewStyle = {
    // Only includes bottom safe area insets via $bottomContainerInsets in the component
}

// FIX: Style for the scrollable middle section
const $scrollableInterests = (theme: any): ViewStyle => ({
    flex: 1, // Key to make it take all remaining space
    backgroundColor: theme.colors.background,
})

// FIX: Style for the buttons now placed inside the ScrollView
const $buttonsBelowInterests: ViewStyle = {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.lg, // Added margin bottom to push buttons above the fixed safe area view
}

const $preferencesListContainer: ViewStyle = {
  // empty
}

const $noPreferencesText = (theme: any): TextStyle => ({
  fontSize: 14,
  color: theme.colors.textDim,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.md,
  backgroundColor: theme.colors.backgroundMuted,
  borderRadius: spacing.sm,
})

// --- NEW STYLES FOR VER TODO ---
const $seeAllButton: ViewStyle = {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    // Removed margin because it's managed by parent flexbox
}

const $seeAllText = (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.tint,
    fontWeight: "600",
})
// END NEW/UPDATED STYLES

export const createModalStyles = (theme: any) => ({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  } as ViewStyle,

  modalContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: spacing.lg,
    width: "100%",
    maxWidth: width * 0.9,
    maxHeight: height * 0.8,
    elevation: 10,
    padding: spacing.lg,
  } as ViewStyle,

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.md,
  } as ViewStyle,

  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
  } as TextStyle,

  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.palette.neutral200,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  modalCloseText: {
    fontSize: 18,
    color: theme.colors.textDim,
    fontWeight: "500",
  } as TextStyle,

  modalBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,

  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: spacing.md,
  } as ViewStyle,

  modalPrimaryButton: {
    flex: 1,
    backgroundColor: theme.colors.tint,
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,

  modalSecondaryButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,

  modalPrimaryButtonText: {
    color: theme.colors.tintInverse,
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,

  modalSecondaryButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,

  modalContent: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  } as TextStyle,

  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textDim,
    marginBottom: spacing.lg,
  } as TextStyle,

  modalSection: {
    marginBottom: spacing.lg,
  } as ViewStyle,

  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: spacing.md,
  } as TextStyle,

  modalListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,

  modalListItemText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  } as TextStyle,

  modalListItemIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  } as TextStyle,

  modalInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.palette.neutral100,
    marginBottom: spacing.md,
  } as ViewStyle,

  modalTextArea: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.palette.neutral100,
    minHeight: 100,
    textAlignVertical: "top",
  } as ViewStyle,

  modalDangerButton: {
    flex: 1,
    backgroundColor: theme.colors.error,
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,

  modalDangerButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,

  modalFullScreen: {
    margin: 0,
    width: width,
    height: height,
    borderRadius: 0,
  } as ViewStyle,

  modalBottomSheet: {
    justifyContent: "flex-end",
    margin: 0,
  } as ViewStyle,

  modalBottomSheetContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingBottom: spacing.xl,
    maxHeight: height * 0.7,
  } as ViewStyle,

  modalBottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.palette.neutral400,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  } as ViewStyle,

  modalCard: {
    backgroundColor: theme.colors.palette.neutral100,
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  } as ViewStyle,

  modalCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: spacing.xs,
  } as TextStyle,

  modalCardSubtitle: {
    fontSize: 14,
    color: theme.colors.textDim,
  } as TextStyle,

  modalScrollView: {
    maxHeight: height * 0.5,
  } as ViewStyle,

  modalCenteredContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  } as ViewStyle,

  modalIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  } as TextStyle,

  modalLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  } as ViewStyle,

  modalLoadingText: {
    fontSize: 16,
    color: theme.colors.textDim,
    marginTop: spacing.md,
  } as TextStyle,

  modalSearchInputContainer: {
    marginBottom: spacing.md,
  } as ViewStyle,

  modalSearchInput: {
    fontSize: 16,
  } as TextStyle,
})

export const modalAnimationConfig = {
  animationType: "fade" as const,
  transparent: true,
  statusBarTranslucent: true,
}

export const bottomSheetAnimationConfig = {
  animationType: "slide" as const,
  transparent: true,
  statusBarTranslucent: true,
}

const $listWrapper: ViewStyle = {
  flex: 1,
  paddingBottom: spacing.lg,
  backgroundColor: "transparent",
}