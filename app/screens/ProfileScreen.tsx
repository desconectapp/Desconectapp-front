"use client"

import { observer } from "mobx-react-lite"
import { useEffect, useRef, useState, useCallback } from "react"
import {
  View,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  FlatList,
} from "react-native"
import { Screen, TextField, Button, Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useForm, Controller } from "react-hook-form"
import { useAppToast } from "@/components/useToast"
import { chatsService } from "@/services/chat"
import { spacing } from "@/theme"
import useImagePicker from "@/hooks/Image"
import { useNavigation } from "@react-navigation/native"
import type { AppStackScreenProps } from "@/navigators"
import { useAddPreferencesBatch, useEditProfile, useProfile, useActivities, useUserPreferences } from "@/hooks/Users"
import { useStores } from "@/models"
import { Pressable } from "react-native"

const defaultAvatar = require("../../assets/images/default-avatar.png")

const { width, height } = Dimensions.get("window")

interface ProfileFormData {
  name: string
  location: string
}

export const ProfileScreen = observer(function ProfileScreen() {
  const { themed, theme } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)

  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()
  const { showToast } = useAppToast()

  const { data: profile } = useProfile()
  const { profileImage, handleImagePicker } = useImagePicker()
  const { mutateAsync: editProfileMutateAsync } = useEditProfile()
  const addPreferences = useAddPreferencesBatch()
  const { sessionStore } = useStores()

  const [selectedPreferences, setSelectedPreferences] = useState<number[]>([])
  const [allPreferences, setAllPreferences] = useState<any[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 10
  const [query, setQuery] = useState("")
  const prevQuery = useRef("")

  const { data: prefsData, isFetching } = useActivities(limit, offset, query)
  const { data: userPreferencesData } = useUserPreferences()

  useEffect(() => {
    if (userPreferencesData && showPreferencesModal) {
      const ids = userPreferencesData?.preferences?.map((p: any) => p.id) || []

      setSelectedPreferences(ids)
      setAllPreferences((prev) => [
        ...userPreferencesData.preferences,
        ...prev.filter((p) => !ids.includes(p.id)),
      ])
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

  const togglePreference = useCallback((id: number) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }, [])

  const handleSavePreferences = async () => {
    try {
      await addPreferences.mutateAsync({activity_ids: selectedPreferences})
      showToast("Preferences Updated", "Your preferences were saved successfully")
      setShowPreferencesModal(false)
    } catch (err) {
      console.error(err)
      showToast("Error", "Failed to save preferences")
    }
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
      await editProfileMutateAsync({
        ...profile,
        ...data,
        image: profileImage,
      })
      showToast("Profile Updated", "Your profile has been successfully updated")
      setIsEditing(false)
      reset(data)
    } catch (error) {
      console.error("Error updating profile:", error)
      showToast("Update Failed", "There was an error updating your profile")
    } finally {
      setIsSaving(false)
    }
  }

  const logOut = () => {
    // Clear Supabase token cache
    chatsService.clearSupabaseCache()
    sessionStore.setSession(null)
    navigation.navigate("LoginScreen")
  }

  const onCancel = () => {
    reset()
    setIsEditing(false)
  }

  return (
    <Screen
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={theme.colors.background}
    >
      <Text preset="heading" style={themed({ fontSize: 24, fontWeight: "bold" })}>
        My Profile
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
              <Image
                source={profileImage ? { uri: profileImage } : defaultAvatar}
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
                required: "Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters long" },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={$fieldContainer}>
                  {isEditing ? (
                    <TextField
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter your name"
                      helper={errors.name?.message}
                      status={errors.name ? "error" : undefined}
                      autoCapitalize="words"
                      style={$editInput}
                    />
                  ) : (
                    <Text style={themed($displayName)}>{value || "Your Name"}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="location"
              rules={{
                required: "Location is required",
                minLength: { value: 2, message: "Please enter a valid location" },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={$fieldContainer}>
                  {isEditing ? (
                    <TextField
                      value={value}
                      onChangeText={onChange}
                      placeholder="City, Country"
                      helper={errors.location?.message}
                      status={errors.location ? "error" : undefined}
                      autoCapitalize="words"
                      style={$editInput}
                    />
                  ) : (
                    <Text style={themed($displayLocation)}>{value || "Your Location"}</Text>
                  )}
                </View>
              )}
            />
          </View>
        </View>

        {isEditing && (
          <View style={$buttonContainer}>
            <Button
              text={isSaving ? "Saving..." : "Save Changes"}
              onPress={handleSubmit(onSubmit)}
              style={themed($saveButton)}
              textStyle={themed($saveButtonText)}
              loading={isSaving}
              disabled={isSaving || (!isDirty && profileImage === null)}
            />

            <Button
              text={"Cancel"}
              onPress={onCancel}
              style={themed($cancelButton)}
              textStyle={themed($cancelButtonText)}
            />
          </View>
        )}
      </Pressable>

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
        <Text style={themed($settingsButtonText)}>{"Edit Preferences"}</Text>
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
        <Text style={themed($settingsButtonText)}>{"Log out"}</Text>
      </Pressable>

      <Modal
        visible={showPreferencesModal}
        onRequestClose={() => setShowPreferencesModal(false)}
        {...modalAnimationConfig}
      >
        <View style={createModalStyles(theme).modalOverlay}>
          <View style={createModalStyles(theme).modalContainer}>
            <View style={createModalStyles(theme).modalHeader}>
              <Text style={createModalStyles(theme).modalTitle}>Select Preferences</Text>
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
              placeholder="Search preferences..."
              autoCapitalize="none"
            />

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
                <Text style={createModalStyles(theme).modalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={createModalStyles(theme).modalPrimaryButton}
                onPress={handleSavePreferences}
              >
                <Text style={createModalStyles(theme).modalPrimaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  )
})

const $chip: ViewStyle = {
  flex: 1,
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
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
}

const $screenBackground = (theme: any) => ({
  backgroundColor: theme.colors.background,
})

const $settingsButton = (theme: any): ViewStyle => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: theme.colors.palette.neutral200,
  justifyContent: "center",
  alignItems: "center",
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
  marginBottom: 8,
  width: 40,
  height: 40,
  borderRadius: 20,
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
