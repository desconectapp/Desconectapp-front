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
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from "react-native"
import { Button, Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"

import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import { useExitGroup, useGroupById, useChangeGroupStatus, updateGroupDescription, updateGroupName as useUpdateGroupName, updateGroupLocation as useUpdateGroupLocation} from "@/hooks/Groups"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AppStackParamList } from "@/navigators/AppNavigator"
import { GroupData, Member } from "@/services/groups/Groups.types"

import { useQueryClient } from "@tanstack/react-query"
import { FontAwesome } from '@expo/vector-icons';


type NavigationProp = NativeStackNavigationProp<AppStackParamList, "Main">

export const GroupInfoScreen = observer(function GroupInfoScreen({ route }: any) {
  const { groupId } = route.params
  

  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const navigation = useNavigation<NavigationProp>()
  const { showToast } = useAppToast()

  const queryClient = useQueryClient()

  const { mutateAsync: exitGroupAsync } = useExitGroup()
  const [modalVisible, setModalVisible] = useState(false)

  const { data: groupData, isLoading } = useGroupById(groupId)

  const isPrivate = !groupData?.public;
  const { mutateAsync: statusChangeAsync } = useChangeGroupStatus()

  const [isModalVisible, setIsModalVisible] = useState(false)

  const { mutate: updateDescription } = updateGroupDescription();
  const { mutate: updateGroupName } = useUpdateGroupName();
  const { mutate: updateGroupLocation } = useUpdateGroupLocation();
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState("")
  const [tempDescription, setTempDescription] = useState("")
  const [tempLocation, setTempLocation] = useState("")

  const handlePressLeave = () => {
    setIsModalVisible(true);
  };

  const handleConfirmLeave = () => {
    setIsModalVisible(false);
    leaveGroup();
  };

  const handleCancelLeave = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (groupData) {
      setTempName(groupData.name);
      setTempDescription(groupData.description ?? "");
      setTempLocation(groupData.location ?? "");
    }
  }, [groupData]);

  const renderMember = ({ item }: { item: Member }) => (
      <View style={[styles.memberItem, themed(themedStyles.memberItem)]}>
      <View style={[styles.memberAvatar, themed(themedStyles.memberAvatar)]}>
          {item.picture ? (
          <Image
              source={{ uri: item.picture }}
              style={themed(themedStyles.memberAvatarImage)}
          />
      ) : (
          <View style={themed(themedStyles.memberAvatarPlaceholder)}>
          <Text style={themed(themedStyles.memberAvatarText)}>
              {item.name.charAt(0).toUpperCase()}
          </Text>
          </View>
      )}
      </View>
      <Text style={themed(themedStyles.memberName)}>{item.name}</Text>
      </View>
  )

  if (isLoading) {
      return <Text>Loading...</Text>
  }

  if (!groupData) {
    return (
        <View>
            <Text>Group not found or has been left.</Text>
            <Button onPress={() => navigation.goBack()} text="Go Back" />
        </View>
    );
  }

  const leaveGroup = async () => {
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
        });
        
      await exitGroupAsync(groupId);

      await queryClient.removeQueries({ queryKey: ["group", groupId] });
      
      await queryClient.invalidateQueries({ queryKey: ["groups"] });

      showToast("Success", "You have left the group successfully.");
    } catch (error) {
        console.error("Error leaving group:", error);
        showToast("Error", "Failed to leave the group. Please try again.");
    }
  }

  const handleSave = async () => {
  try {
    if (tempName !== groupData.name) {
      updateGroupName({ id: groupData.id, name: tempName }); 
    }

    if (tempDescription !== groupData.description) {
      updateDescription({ id: groupData.id, description: tempDescription });
    }

    if (tempLocation !== groupData.location) {
        updateGroupLocation({ id: groupData.id, location: tempLocation });
    }
    
    setIsEditing(false);
    queryClient.setQueryData(['group', groupId], (oldData: GroupData) => ({
        ...oldData,
        name: tempName,
        description: tempDescription,
      }));
  } catch (error) {
    console.error("Failed to save changes:", error);
  }
};

  const handleCancelEdit = () => {
    // Reset temp state to original values
    setTempName(groupData.name);
    setTempDescription(groupData.description ?? "");
    setIsEditing(false);
  };


  const handleStatusChange = async (newStatus: boolean) => {
    try {
      await statusChangeAsync({ id: groupId, public_g: newStatus });
      setModalVisible(false);
      queryClient.setQueryData(['group', groupId], (oldData: GroupData) => ({
        ...oldData,
        status: newStatus,
      }));
    } catch (error) {
      console.error("Failed to change group status:", error);
    }
  };

  const handleModalPress = () => {
    setModalVisible(true);
  };

  const renderModalContent = () => {
    if (isPrivate) {
      return (
        <>
          <Text style={styles.modalTitle}>Would you like to make the group public?</Text>
          <Text style={styles.modalDescription}>This will allow others to view and join the group.</Text>
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={[styles.modalButton, themed(themedStyles.cancelButton)]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, themed(themedStyles.acceptButton)]}
              onPress={() => handleStatusChange(true)}
            >
              <Text style={styles.modalButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    } else {
      return (
        <>
          <Text style={styles.modalTitle}>Would you like to make the group private?</Text>
          <Text style={styles.modalDescription}>This will prevent others from viewing and joining the group.</Text>
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={[styles.modalButton, themed(themedStyles.cancelButton)]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, themed(themedStyles.acceptButton)]}
              onPress={() => handleStatusChange(false)} // Set status to false (private)
            >
              <Text style={styles.modalButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }
  };


  return (
      <SafeAreaView
          style={[styles.container, themed(themedStyles.container)]}
          >
          <View style={[styles.header, themed(themedStyles.header), $topInsets]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 10 }}
            >
              <Text style={themed(themedStyles.backButtonText)}>←</Text>
            </TouchableOpacity>
            
            <Text style={themed(themedStyles.headerTitle)}>Group Info</Text>
            
            {/* Conditional Edit/Save/Cancel Buttons */}
            {isEditing ? (
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
            )}
            
            {/* Lock Icon */}
            <TouchableOpacity
              style={styles.lockButton}
              onPress={handleModalPress}
            >
              <FontAwesome
                name={isPrivate ? "lock" : "unlock"}
                size={24}
                color={theme.colors.tint}
              />
            </TouchableOpacity>
          </View>

          {/* Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
            }}
          >
            <View style={styles.centeredView}>
              <View style={[styles.modalView, themed(themedStyles.modalView)]}>
                {renderModalContent()}
              </View>
            </View>
          </Modal>

          {/* Group Info (Conditionally Rendered) */}
          <View style={[styles.groupInfoContainer, themed(themedStyles.groupInfoSection)]}>
              <Text style={themed(themedStyles.groupIcon)}>{groupData.icon}</Text>
              
              {isEditing ? (
                  <TextInput
                    style={themed(themedStyles.groupNameInput)}
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder="Group Name"
                  />
              ) : (
                  <Text style={themed(themedStyles.groupName)}>{groupData.name}</Text>
              )}

              {isEditing ? (
                  <TextInput
                    style={themed(themedStyles.groupLocationInput)}
                    value={tempLocation}
                    onChangeText={setTempLocation}
                    placeholder="Group Location"
                  />
              ) : (
                  <Text style={themed(themedStyles.groupLocation)}>{groupData.location}</Text>
              )}

              {isEditing ? (
                  <TextInput
                    style={themed(themedStyles.groupDescriptionInput)}
                    value={tempDescription}
                    onChangeText={setTempDescription}
                    multiline
                    placeholder="Group Description"
                  />
              ) : (
                  <Text style={themed(themedStyles.groupDescription)}>{groupData.description}</Text>
              )}
          </View>

          {/* Members List */}
          <FlatList
              data={groupData.members}
              keyExtractor={(item) => item.id}
              renderItem={renderMember}
              contentContainerStyle={styles.membersListContent}
              showsVerticalScrollIndicator={false}
          />


          {/* Footer */}
          <View style={[styles.footer, themed(themedStyles.footer), $bottomInsets]}>
            <Button
              text="Leave Group"
              preset="default"
              style={[styles.leaveButton, themed(themedStyles.leaveButton)]}
              textStyle={[styles.leaveButtonText, themed(themedStyles.leaveButtonText)]}
              pressedStyle={themed(themedStyles.pressedLeaveButton)}
              pressedTextStyle={themed(themedStyles.pressedLeaveButtonText)}
              onPress={handlePressLeave}
            />

            {/* The Modal Component */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={handleCancelLeave}
            >
              <View style={styles.centeredView}>
                <View style={[styles.modalView, themed(themedStyles.modalView)]}>
                  <Text style={styles.modalTitle}>Leave Group?</Text>
                  <Text style={styles.modalDescription}>
                    Are you sure you want to leave this group? This can not be undone.
                  </Text>
                  <View style={styles.modalButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={handleCancelLeave}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.acceptLeaveButton, themed(themedStyles.acceptLeaveButton)]}
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

  // Header
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
    marginRight: spacing.md,
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

  // Modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } as ViewStyle,
  
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
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
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  } as TextStyle,

  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.md,
  } as TextStyle,

  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  } as ViewStyle,

  modalButton: {
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: '45%',
    alignItems: 'center',
  } as ViewStyle,

  acceptButton: {
    backgroundColor: '#2196F3',
  } as ViewStyle,

  cancelButton: {
    backgroundColor: '#ddd',
  } as ViewStyle,

  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  } as TextStyle,

  // Group info
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

  // Members
  membersListContent: {
    paddingBottom: 100
  } as ViewStyle,

  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  } as ViewStyle,

  memberAvatar: {
    marginRight: spacing.md,
  } as ViewStyle,

  memberAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  } as ImageStyle,

  memberAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  memberAvatarText: {
    fontSize: 18,
    fontWeight: "600",
  } as TextStyle,

  memberName: {
    fontSize: 16,
    fontWeight: "500",
  } as TextStyle,

  // Footer
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

  // Header
  headerTitle: (theme: any): TextStyle => ({
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
    flex: 1, 
    marginRight: spacing.md
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

  // Group info
  groupInfoSection: (theme: any): ViewStyle => ({
    alignItems: "center",
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  }),
  groupIcon: (_theme: any): TextStyle => ({
    fontSize: 60,         // bigger font size
    lineHeight: 72,       // slightly larger lineHeight
    height: 72,           // match lineHeight
    textAlignVertical: "center",
    textAlign: "center",
    marginBottom: spacing.sm,
    }),
  groupName: (theme: any): TextStyle => ({
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: spacing.sm,
  }),

  groupNameInput: (theme: any): TextStyle => ({
    fontSize: 24,
    fontWeight: "bold",
    marginTop: spacing.sm,
    color: theme.colors.text,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.tint,
    paddingVertical: spacing.xs,
  }),

  groupLocation: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.textDim,
    marginTop: spacing.xs,
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
  }),

  groupLocationInput: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.text,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.tint,
    borderRadius: spacing.xs,
    padding: spacing.sm,
  }),

  divider: (theme: any): ViewStyle => ({
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: spacing.md,
  }),

  // Member list
  memberItem: (theme: any): ViewStyle => ({
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  }),
  memberAvatar: (_theme: any): ViewStyle => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  }),
  memberAvatarImage: (_theme: any): ImageStyle => ({
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  }),
  memberAvatarPlaceholder: (theme: any): ViewStyle => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.tint,
    justifyContent: "center",
    alignItems: "center",
  }),
  memberAvatarText: (theme: any): TextStyle => ({
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.tintInverse,
  }),
  memberName: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.text,
  }),

  // Footer
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
    alignItems: 'center',
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
    width: '100%',
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
    backgroundColor: '#ddd',
  }),

  editButtonText: (theme: any): TextStyle => ({
    fontSize: 20,
    color: theme.colors.tint,
    marginLeft: spacing.sm,
  }),
}