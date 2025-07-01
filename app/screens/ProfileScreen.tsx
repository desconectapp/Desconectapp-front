"use client"

import { observer } from "mobx-react-lite"
import { useState } from "react"
import {
  View,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native"
import { Screen, TextField, Button, Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useForm, Controller } from "react-hook-form"
import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import useImagePicker from "@/hooks/Image"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "@/navigators"

const defaultAvatar = require("../../assets/images/default-avatar.png")

const { width } = Dimensions.get("window")

interface ProfileFormData {
  name: string
  location: string
  workStatus: string
}

export const ProfileScreen = observer(function ProfileScreen() {
  const { themed } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()
  const { showToast } = useAppToast()
  const { profileImage, handleImagePicker } = useImagePicker()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: "John Doe",
      location: "New York, USA",
      workStatus: "full-time",
    },
  })

  const onCancel = () => {
    reset()
    setIsEditing(false)
    showToast("Changes Discarded", "Your changes have been cancelled")
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground)}
    >
      <View style={$headerContainer}>
        <Text preset="heading" style={themed($titleText)}></Text>

        {!isEditing && (
          <TouchableOpacity
            style={themed($editButton)}
            onPress={() => setIsEditing(true)}
            activeOpacity={0.7}
          >
            <Text style={themed($editButtonText)}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={$profileImageContainer}>
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
                <Text style={themed($imageEditText)}>Edit</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={$formContainer}>
        <Controller
          control={control}
          name="name"
          rules={{
            required: "Name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters long",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={$fieldContainer}>
              <Text preset="formLabel" style={themed($labelText)}>
                Full Name
              </Text>
              {isEditing ? (
                <TextField
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter your name"
                  helper={errors.name?.message}
                  status={errors.name ? "error" : undefined}
                  autoCapitalize="words"
                />
              ) : (
                <View style={themed($displayValueContainer)}>
                  <Text style={themed($displayValueText)}>{value}</Text>
                </View>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="location"
          rules={{
            required: "Location is required",
            minLength: {
              value: 2,
              message: "Please enter a valid location",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={$fieldContainer}>
              <Text preset="formLabel" style={themed($labelText)}>
                Location
              </Text>
              {isEditing ? (
                <TextField
                  value={value}
                  onChangeText={onChange}
                  placeholder="City, Country"
                  helper={errors.location?.message}
                  status={errors.location ? "error" : undefined}
                  autoCapitalize="words"
                />
              ) : (
                <View style={themed($displayValueContainer)}>
                  <Text style={themed($displayValueText)}>{value}</Text>
                </View>
              )}
            </View>
          )}
        />

        {isEditing && (
          <View style={$buttonContainer}>
            <Button
              text={isSaving ? "Saving..." : "Save Changes"}
              onPress={handleSubmit(() => {
                console.log("Profile data submitted")
              })}
              style={themed($saveButton)}
              textStyle={themed($saveButtonText)}
              loading={isSaving}
              disabled={isSaving || !isDirty}
            />

            <TouchableOpacity
              style={themed($cancelButton)}
              onPress={onCancel}
              activeOpacity={0.7}
              disabled={isSaving}
            >
              <Text style={themed($cancelButtonText)}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xxl,
}

const $screenBackground = (theme: any) => ({
  backgroundColor: theme.colors.background,
})

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xl,
}

const $titleText = (theme: any): TextStyle => ({
  color: theme.colors.text,
})

const $editButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: spacing.sm,
})

const $editButtonText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontWeight: "600",
  fontSize: 14,
})

const $profileImageContainer: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.xl,
}

const $imageWrapper: ViewStyle = {
  position: "relative",
}

const $profileImage: ImageStyle = {
  width: width * 0.35,
  height: width * 0.35,
  borderRadius: (width * 0.35) / 2,
  borderWidth: 4,
  borderColor: "#ffffff",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.15,
  shadowRadius: 12,
}

const $imageEditOverlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: (width * 0.35) / 2,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  justifyContent: "center",
  alignItems: "center",
}

const $imageEditButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: spacing.sm,
})

const $imageEditText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  backgroundColor: theme.colors.angry100,
  fontWeight: "600",
  fontSize: 12,
})

const $formContainer: ViewStyle = {
  flex: 1,
}

const $fieldContainer: ViewStyle = {
  marginBottom: spacing.lg,
}

const $labelText = (theme: any): TextStyle => ({
  color: theme.colors.text,
  marginBottom: spacing.sm,
  fontWeight: "600",
})

const $displayValueContainer = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.palette.neutral100,
  borderRadius: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  borderWidth: 1,
  borderColor: theme.colors.border,
})

const $displayValueText = (theme: any): TextStyle => ({
  color: theme.colors.text,
  fontSize: 16,
})

const $buttonContainer: ViewStyle = {
  marginTop: spacing.xl,
  gap: spacing.md,
}

const $saveButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  borderRadius: spacing.md,
  minHeight: 56,
  shadowColor: theme.colors.tint,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
})

const $saveButtonText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontWeight: "600",
  fontSize: 16,
})

const $cancelButton = (theme: any): ViewStyle => ({
  backgroundColor: "transparent",
  borderWidth: 1.5,
  borderColor: theme.colors.border,
  borderRadius: spacing.md,
  paddingVertical: spacing.md,
  alignItems: "center",
})

const $cancelButtonText = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  fontWeight: "600",
  fontSize: 16,
})
