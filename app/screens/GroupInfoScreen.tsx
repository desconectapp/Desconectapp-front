import { observer } from "mobx-react-lite"
import { useState, useRef, useCallback } from "react"
import {
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from "react-native"
import { Button, Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"

import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import { MessageBubble, Message } from "@/components/Custom/Message"
import { useExitGroup, useGroupById } from "@/hooks/Groups"

import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AppStackParamList } from "@/navigators/AppNavigator"
import { Member } from "@/services/groups/Groups.types"

import { useQueryClient } from "@tanstack/react-query"

type NavigationProp = NativeStackNavigationProp<AppStackParamList, "Main">

export const GroupInfoScreen = observer(function GroupInfoScreen({ route }: any) {
    const { groupId } = route.params

    const { themed } = useAppTheme()
    const $topInsets = useSafeAreaInsetsStyle(["top"])
    const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
    const navigation = useNavigation<NavigationProp>()
    const { showToast } = useAppToast()

    const [showMembers, setShowMembers] = useState(false)
    const flatListRef = useRef<FlatList>(null)

    const queryClient = useQueryClient()

    const { data: groupData, isLoading } = useGroupById(groupId)
    const { mutateAsync: exitGroupAsync } = useExitGroup()



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
        // This is the critical change. If groupData is null or undefined,
        // it means the group does not exist. We should not render the screen
        // and instead navigate the user back to a safe place.
        // You could also show a "Group not found" message.
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
  };



    return (
        <SafeAreaView
            style={[styles.container, themed(themedStyles.container), $topInsets, $bottomInsets]}
            >
            {/* Header */}
            <View style={[styles.header, themed(themedStyles.header)]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 10 }}
                    >
                    <Text style={themed(themedStyles.backButtonText)}>←</Text>
                </TouchableOpacity>
                
                <Text style={themed(themedStyles.headerTitle)}>Group Info</Text>
            </View>

            {/* Group Info */}
            <View style={[styles.groupInfoContainer, themed(themedStyles.groupInfoSection)]}>
                <Text style={themed(themedStyles.groupIcon)}>{groupData.icon}</Text>
                <Text style={themed(themedStyles.groupName)}>{groupData.name}</Text>
                <Text style={themed(themedStyles.groupLocation)}>{groupData.location}</Text>
                <Text style={themed(themedStyles.groupDescription)}>{groupData.description}</Text>
            </View>
            <View style={themed(themedStyles.divider)} />

            {/* Members List */}
            <FlatList
                ref={flatListRef}
                data={groupData.members}
                keyExtractor={(item) => item.id}
                renderItem={renderMember}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />


            {/* Footer */}
            <View style={[styles.footer, themed(themedStyles.footer)]}>
                <Button
                text="Leave Group"
                preset="default"
                style={[styles.leaveButton, themed(themedStyles.leaveButton)]}
                textStyle={[styles.leaveButtonText, themed(themedStyles.leaveButtonText)]}
                pressedStyle={themed(themedStyles.pressedLeaveButton)}
                pressedTextStyle={themed(themedStyles.pressedLeaveButtonText)}
                onPress={leaveGroup}
                />
            </View>
        </SafeAreaView>
    )
})

export const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,

  backButton: { paddingRight: spacing.md } as ViewStyle,

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  } as ViewStyle,

  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  } as TextStyle,

  headerButton: {
    fontSize: 16,
    fontWeight: "600",
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
  membersList: { flex: 1 } as ViewStyle,

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
})



export const themedStyles = {
  container: (theme: any): ViewStyle => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }),

  backButtonText: (theme: any): TextStyle => ({
    fontSize: 24,
    color: theme.colors.tint,
    fontWeight: "600",
  }),

  // Header
  header: (theme: any): ViewStyle => ({
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  }),
  headerTitle: (theme: any): TextStyle => ({
    fontSize: 20,
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
}

