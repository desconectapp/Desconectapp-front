"use client"

import { observer } from "mobx-react-lite"
import { useEffect, useState } from "react"
import {
  View,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from "react-native"
import { Screen, TextField, Button, Text, AutoImage } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useForm, Controller } from "react-hook-form"
import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import useImagePicker from "@/hooks/Image"
import { useNavigation } from "@react-navigation/native"
import type { AppStackScreenProps } from "@/navigators"
import { useEditProfile, useProfile } from "@/hooks/Users"
import { useStores } from "@/models"
import { Pressable } from "react-native"

// import defaultAvatar from "../../assets/images/default-avatar.png"
import defaultAvatar from "../../assets/images/logo.png"
import { ActivityRequestsList } from "@/components/Custom/ActivitiesRequestList"

const { width, height } = Dimensions.get("window")

interface ProfileFormData {
  name: string
  location: string
  workStatus: string
}

export const ProfileScreen = observer(function ProfileScreen() {
  const { themed, theme } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()
  const { showToast } = useAppToast()

  const [modalVisible, setModalVisible] = useState(true)

  const { data: profile } = useProfile()
  const { profileImage, handleImagePicker } = useImagePicker()
  const { mutateAsync: editProfileMutateAsync } = useEditProfile()

  const modalStyles = createModalStyles(theme)

  const { sessionStore } = useStores()

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
  })

  const onSubmit = async (data: ProfileFormData) => {
    console.log(profileImage)
    setIsSaving(true)
    try {
      await editProfileMutateAsync({
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
    sessionStore.setSession(null)
    navigation.navigate("LoginScreen")
  }

  const onCancel = () => {
    reset()
    setIsEditing(false)
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
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
                    <Text style={themed($imageEditText)}>📷</Text>
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

      <ActivityRequestsList onItemPress={(item) => setModalVisible(true)} />

      <Modal
        {...modalAnimationConfig}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalHeader}>
              <Text style={themed(modalStyles.modalTitle)}>Are you sure you want cancel this request?</Text>
              <TouchableOpacity
                style={modalStyles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={modalStyles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={modalStyles.modalBody}>
              <Pressable style={modalStyles.modalPrimaryButton} onPress={() => {}}>
                <Text style={modalStyles.modalPrimaryButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
    </Screen>
  )
})

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

  backgroundColor: theme.colors.palette.neutral100,
  borderRadius: spacing.lg,
  padding: spacing.lg,
  marginBottom: spacing.xl,
  shadowColor: theme.colors.palette.neutral900,
  shadowOffset: {
    width: 0,
    height: 2,
  },
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
  borderRadius: spacing.md,
  minHeight: 50,
  borderWidth: 1.5,
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
