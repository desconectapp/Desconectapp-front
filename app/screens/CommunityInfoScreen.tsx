import { observer } from "mobx-react-lite"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from "react-native"
import { Button, Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"

import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import {
  useExitGroup, 
  updateGroupDescription,
  updateGroupName as useUpdateGroupName,
  updateGroupLocation as useUpdateGroupLocation,
  useUpdateGroupPhoto,
} from "@/hooks/Groups"
import { useCommunityById } from "@/hooks/Communities"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AppStackParamList } from "@/navigators/AppNavigator"
import { GroupData } from "@/services/groups/Groups.types" // NOTE: Replace GroupData with CommunityData if available
import { selectedLocation } from "types"

import { useQueryClient } from "@tanstack/react-query"
import { FontAwesome } from "@expo/vector-icons"

import { AutoImage } from "@/components"
import useImagePicker from "@/hooks/Image"
import { useUploadGroupImage } from "@/hooks/Chats"

type FullNavigationProp = NativeStackNavigationProp<AppStackParamList>

const formatTimeDisplay = (timeString: string | undefined): string => {
    if (!timeString) return "No Time Set"
    // Example: Simple display, replace with your actual formatting logic
    return new Date(timeString).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
}


export const CommunityInfoScreen = observer(function CommunityInfoScreen({ route }: any) {
  const { communityId } = route.params

  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const navigation = useNavigation<FullNavigationProp>()
  const { showToast } = useAppToast()

  const queryClient = useQueryClient()

  const { mutateAsync: exitGroupAsync } = useExitGroup()
  
  const { data: communityData, isLoading } = useCommunityById(communityId)!!!!!

  const [isModalVisible, setIsModalVisible] = useState(false)

  const { mutate: updateDescription } = updateGroupDescription()
  const { mutate: updateGroupName } = useUpdateGroupName()
  const { mutate: updateGroupLocation } = useUpdateGroupLocation()
  const { mutate: updateGroupPhoto } = useUpdateGroupPhoto()

  // Editing States
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState("")
  const [tempDescription, setTempDescription] = useState("")
  const [tempLocation, setTempLocation] = useState("")
  const [tempDisplayLocation, setTempDisplayLocation] = useState("")
  const [tempEventTime, setTempEventTime] = useState("") 

  const { imageUri, handleImagePicker } = useImagePicker()
  const { isPending: isUploadingImage, mutateAsync: uploadGroupImageAsync } = useUploadGroupImage()

  const isAdmin = communityData?.is_current_user_admin ?? false

  const handlePressLeave = () => {
    setIsModalVisible(true)
  }

  const handleConfirmLeave = () => {
    setIsModalVisible(false)
    leaveCommunity()
  }

  const handleCancelLeave = () => {
    setIsModalVisible(false)
  }

  useEffect(() => {
    if (communityData) {
      setTempName(communityData.name)
      setTempDescription(communityData.description ?? "")
      setTempDisplayLocation(communityData.location ?? "")
      setTempLocation("") 
    }
  }, [communityData])

  // --- Location Handlers ---
  const handleLocationSelect = useCallback((selectedLoc: selectedLocation) => {
      const coordString = `${selectedLoc.longitude},${selectedLoc.latitude}`
      setTempLocation(coordString) 
      setTempDisplayLocation(selectedLoc.name || selectedLoc.address)
      
      showToast("Success", `New location selected: ${selectedLoc.name || selectedLoc.address}`)
  }, [showToast])

  const handleOpenLocationPicker = () => {
      if (!isEditing) return
      
      navigation.navigate("LocationPickerScreen" as any, { 
          onLocationSelect: handleLocationSelect,
      })
  }

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  if (!communityData) {
    return (
      <View>
        <Text>Community not found or has been left.</Text>
        <Button onPress={() => navigation.goBack()} text="Go Back" />
      </View>
    )
  }

  const leaveCommunity = async () => {
    try {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Main",
            params: {
              screen: "Tabs",
              params: { screen: "SearchScreen" },
            },
          },
        ],
      })

      await exitGroupAsync(communityId)
      await queryClient.removeQueries({ queryKey: ["community", communityId] }) // INVALIDATION KEY: Changed to 'community'
      await queryClient.invalidateQueries({ queryKey: ["communities"] }) // INVALIDATION KEY: Changed to 'communities'
      showToast("Success", "You have left the community successfully.")
    } catch (error) {
      console.error("Error leaving community:", error)
      showToast("Error", "Failed to leave the community. Please try again.")
    }
  }

  const handleSave = async () => {
    try {
      // if (imageUri) {
      //   const url = await uploadGroupImageAsync({ communityId, uri: imageUri })
      //   updateGroupPhoto({ id: communityData.id, avatar_url: url })
      // }

      if (tempName !== communityData.name) {
        updateGroupName({ id: communityData.id, name: tempName })
      }

      if (tempDescription !== communityData.description) {
        updateDescription({ id: communityData.id, description: tempDescription })
      }

      const locationHasChanged = 
        tempLocation !== "" || tempDisplayLocation !== communityData.location

      if (locationHasChanged) {
        updateGroupLocation({ 
          id: communityData.id, 
          location: tempLocation,
          location_name: tempDisplayLocation
        })
      }
      

      setIsEditing(false)

      queryClient.setQueryData(["community", communityId], (oldData: GroupData) => ({
        ...oldData,
        name: tempName,
        description: tempDescription,
        location: tempDisplayLocation, 
        location_name: tempDisplayLocation, 
      }))
    } catch (error) {
      console.error("Failed to save changes:", error)
    }
  }

  const handleCancelEdit = () => {
    setTempName(communityData.name)
    setTempDescription(communityData.description ?? "")
    setTempLocation("") 
    setTempDisplayLocation(communityData.location ?? "")
    setIsEditing(false)
  }

  const currentLocationDisplay = isEditing 
    ? (tempDisplayLocation || "Tap to set location...")
    : (communityData.location_name || communityData.location || "No Location Set")

  const locationTextStyle = isEditing && !tempDisplayLocation
    ? themedStyles.locationPlaceholderText
    : themedStyles.groupLocationInput

  const timeTextStyle = isEditing && !tempEventTime
    ? themedStyles.locationPlaceholderText
    : themedStyles.groupLocationInput


  return (
    <SafeAreaView style={[styles.container, themed(themedStyles.container)]}>
      <View style={[styles.header, themed(themedStyles.header), $topInsets]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 10 }}
        >
          <Text style={themed(themedStyles.backButtonText)}>←</Text>
        </TouchableOpacity>

        <Text style={themed(themedStyles.headerTitle)}>Community Info</Text>

        {/* Conditional Edit/Save/Cancel Buttons - Only visible if isAdmin is true */}
        {isAdmin && (
            isEditing ? (
                <View style={styles.headerButtonContainer}>
                    <Pressable onPress={handleCancelEdit}>
                        <Text style={themed(themedStyles.headerCancelButton)}>Cancel</Text>
                    </Pressable>
                    <Pressable onPress={handleSave} style={{ marginLeft: spacing.sm }}>
                        <Text style={themed(themedStyles.headerButton)}>Save</Text>
                    </Pressable>
                </View>
            ) : (
                <Pressable onPress={() => setIsEditing(true)}>
                    <Text style={themed(themedStyles.editButtonText)}>✏️</Text>
                </Pressable>
            )
        )}
        
        {!isAdmin && !isEditing && <View style={{ width: 40 }} />}
      </View>

      <View style={[styles.groupInfoContainer, themed(themedStyles.groupInfoSection)]}>
        <View style={{ alignItems: "center", marginBottom: spacing.md }}>
          <View style={{ position: "relative" }}>
            <AutoImage
              source={
                imageUri || communityData?.avatar_url
                  ? { uri: imageUri ?? communityData?.avatar_url }
                  : require("../../assets/images/default-avatar.png")
              }
              style={{ width: 100, height: 100, borderRadius: 50 }}
              resizeMode="cover"
            />
            {isEditing && (
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 50,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={handleImagePicker}
                activeOpacity={0.8}
              >
                {isUploadingImage ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ color: "#fff", fontSize: 20 }}>✏️</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isEditing ? (
          <TextInput
            style={themed(themedStyles.groupNameInput)}
            value={tempName}
            onChangeText={setTempName}
            placeholder="Community Name"
          />
        ) : (
          <Text style={themed(themedStyles.groupName)}>{communityData.name}</Text>
        )}

        {/* PLACEHOLDER: Location Section */}
        <View style={styles.placeholderContainer}>
            <Text style={themed(themedStyles.placeholderLabel)}>Location</Text>
            {isEditing ? (
                <Pressable 
                    onPress={handleOpenLocationPicker} 
                    style={[
                        styles.locationPressableContainer, 
                        themed(themedStyles.locationPressableContainer),
                        { marginBottom: spacing.sm }
                    ]}
                >
                    <Text 
                        style={[
                            styles.groupLocation, 
                            themed(locationTextStyle)
                        ]}
                    >
                        {currentLocationDisplay}
                    </Text>
                </Pressable>
            ) : (
                <Text 
                    style={[themed(themedStyles.groupLocation), { marginBottom: spacing.sm }]}
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                >
                    {currentLocationDisplay}
                </Text>
            )}
        </View>

        {/* PLACEHOLDER: Time/Date Section */}
        <View style={styles.placeholderContainer}>
            <Text style={themed(themedStyles.placeholderLabel)}>Time</Text>
            {isEditing ? (
                <TextInput
                    style={[
                        themed(timeTextStyle), 
                        styles.timeInput,
                        { marginBottom: spacing.md }
                    ]}
                    value={tempEventTime}
                    onChangeText={setTempEventTime}
                    placeholder="Tap to set time (e.g., 2025-12-31T10:00:00Z)"
                />
            ) : (
                <Text 
                    style={[themed(themedStyles.groupLocation), { marginBottom: spacing.md }]} 
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                >
                </Text>
            )}
        </View>

        {isEditing ? (
          <TextInput
            style={themed(themedStyles.groupDescriptionInput)}
            value={tempDescription}
            onChangeText={setTempDescription}
            multiline
            placeholder="Community Description"
          />
        ) : (
          <Text style={themed(themedStyles.groupDescription)}>{communityData.description}</Text>
        )}
      </View>

      {/* PLACEHOLDER: Members List Replacement */}
      <View style={styles.placeholderSection}>
        <Text style={themed(themedStyles.sectionTitle)}>About the Community</Text>
        <Text style={themed(themedStyles.placeholderText)}>
          This section contains information about the community, such as description, location, and time.
        </Text>
      </View>

      {/* Footer */}
      <View style={[styles.footer, themed(themedStyles.footer), $bottomInsets]}>
        <Button
          text="Leave Community"
          preset="default"
          style={[styles.leaveButton, themed(themedStyles.leaveButton)]}
          textStyle={[styles.leaveButtonText, themed(themedStyles.leaveButtonText)]}
          pressedStyle={themed(themedStyles.pressedLeaveButton)}
          pressedTextStyle={themed(themedStyles.pressedLeaveButtonText)}
          onPress={handlePressLeave}
        />

        {/* Leave Community Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={handleCancelLeave}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, themed(themedStyles.modalView)]}>
              <Text style={styles.modalTitle}>Leave Community?</Text>
              <Text style={styles.modalDescription}>
                Are you sure you want to leave this community? This can not be undone.
              </Text>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancelLeave}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.acceptLeaveButton,
                    themed(themedStyles.acceptLeaveButton),
                  ]}
                  onPress={handleConfirmLeave}
                >
                  <Text style={styles.modalButtonText}>Leave</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
})

export const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,

  descriptionInput: {
    minHeight: 60,
    maxHeight: 120,
    textAlignVertical: "top",
  } as TextStyle,

  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
    alignSelf: "flex-start",
  } as TextStyle,

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  } as ViewStyle,

  headerButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,

  backButton: { paddingRight: spacing.md } as ViewStyle,
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,

  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  } as TextStyle,
  lockButton: { paddingLeft: spacing.md } as ViewStyle,

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  } as ViewStyle,

  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  } as ViewStyle,

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.sm,
    textAlign: "center",
  } as TextStyle,

  modalDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: spacing.md,
  } as TextStyle,

  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  } as ViewStyle,

  modalButton: {
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: "45%",
    alignItems: "center",
  } as ViewStyle,

  acceptButton: {
    backgroundColor: "#2196F3",
  } as ViewStyle,

  cancelButton: {
    backgroundColor: "#ddd",
  } as ViewStyle,

  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  } as TextStyle,

  groupInfoContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  } as ViewStyle,

  groupIcon: {
    fontSize: 32,
    lineHeight: 36,
    height: 36,
    textAlignVertical: "center",
    marginBottom: spacing.sm,
  } as TextStyle,

  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: spacing.xs,
  } as TextStyle,

  groupLocation: {
    fontSize: 16,
    marginTop: spacing.xs,
  } as TextStyle,

  groupDescription: {
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  } as TextStyle,

  divider: {
    height: 1,
    marginVertical: spacing.md,
  } as ViewStyle,

  placeholderContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  } as ViewStyle,

  placeholderSection: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  } as ViewStyle,

  leaveButton: {
    borderColor: "#e53935",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderRadius: 8,
  } as ViewStyle,

  leaveButtonText: {
    color: "#e53935",
    fontWeight: "600",
  } as TextStyle,

  acceptLeaveButton: {
    borderColor: "#e53935",
  } as ViewStyle,

  locationPressableContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  
  timeInput: {
      width: '100%',
  } as TextStyle,
})

export const themedStyles = {
  container: (theme: any): ViewStyle => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }),

  header: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.background,
    borderBottomColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  }),

  backButtonText: (theme: any): TextStyle => ({
    fontSize: 24,
    color: theme.colors.tint,
    fontWeight: "600",
  }),

  headerTitle: (theme: any): TextStyle => ({
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
    flex: 1,
  }),
  headerButton: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.tint,
    fontWeight: "600",
  }),
  headerCancelButton: (theme: any): TextStyle => ({
    fontSize: 16,
    color: "#e53935",
    fontWeight: "600",
  }),

  groupInfoSection: (theme: any): ViewStyle => ({
    alignItems: "center",
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  }),
  groupIcon: (_theme: any): TextStyle => ({
    fontSize: 60,
    lineHeight: 72,
    height: 72,
    textAlignVertical: "center",
    textAlign: "center",
    marginBottom: spacing.sm,
  }),
  groupName: (theme: any): TextStyle => ({
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  }),

  groupNameInput: (theme: any): TextStyle => ({
    fontSize: 24,
    fontWeight: "bold",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    color: theme.colors.text,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.tint,
    paddingVertical: spacing.xs,
    width: '80%',
  }),

  groupLocation: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.text,
    marginTop: spacing.xs,
    textAlign: "center",
    padding: spacing.sm,
  }),

  groupDescription: (theme: any): TextStyle => ({
    fontSize: 14,
    color: theme.colors.textDim,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  }),

  groupDescriptionInput: (theme: any): TextStyle => ({
    fontSize: 14,
    color: theme.colors.text,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.tint,
    borderRadius: spacing.xs,
    padding: spacing.sm,
    minHeight: 80,
    textAlignVertical: "top",
    width: '90%',
  }),

  locationPressableContainer: (theme: any): ViewStyle => ({
    width: '90%',
    alignSelf: "center",
    paddingHorizontal: 0,
  }),

  groupLocationInput: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.text,
    textAlign: "center",
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.tint,
    borderRadius: spacing.xs,
    padding: spacing.sm,
    width: '100%',
  }),
  
  locationPlaceholderText: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.textDim,
    textAlign: "center",
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.tint,
    borderRadius: spacing.xs,
    padding: spacing.sm,
    width: '100%',
  }),

  sectionTitle: (theme: any): TextStyle => ({
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: spacing.sm,
  }),
  placeholderText: (theme: any): TextStyle => ({
      fontSize: 16,
      color: theme.colors.textDim,
      textAlign: 'center',
  }),
  placeholderLabel: (theme: any): TextStyle => ({
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textDim,
      alignSelf: 'flex-start',
      marginBottom: spacing.xs,
  }),

  divider: (theme: any): ViewStyle => ({
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: spacing.md,
  }),

  footer: (theme: any): ViewStyle => ({
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  }),
  leaveButton: (theme: any): ViewStyle => ({
    borderColor: "#e53935",
    borderWidth: 1.5,
    borderRadius: spacing.sm,
    backgroundColor: "transparent",
  }),
  leaveButtonText: (_theme: any): TextStyle => ({
    color: "#e53935",
    fontWeight: "600",
  }),
  pressedLeaveButton: (_theme: any): ViewStyle => ({
    backgroundColor: "rgba(229, 57, 53, 0.08)",
  }),
  pressedLeaveButtonText: (_theme: any): TextStyle => ({
    color: "#e53935",
    opacity: 0.9,
  }),

  modalView: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }),

  modalInput: (theme: any): TextStyle => ({
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    color: theme.colors.text,
  }),

  acceptButton: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.tint,
  }),

  acceptLeaveButton: (theme: any): ViewStyle => ({
    backgroundColor: "#e53935",
  }),

  cancelButton: (theme: any): ViewStyle => ({
    backgroundColor: "#ddd",
  }),

  editButtonText: (theme: any): TextStyle => ({
    fontSize: 20,
    color: theme.colors.tint,
  }),
}