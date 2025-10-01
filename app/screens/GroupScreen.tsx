import { observer } from "mobx-react-lite"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from "react-native"
import { Screen, Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"

import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import { MessageBubble, Message } from "@/components/Custom/Message"
import { useExitGroup, useGroupById } from "@/hooks/Groups"

import { useStores } from "@/models"
import { useCreateMessage, useGetChatMessages, useObtainToken, useMessageSubscription } from "@/hooks/Chats"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { MainStackParamList } from "@/navigators/MainNavigator"

type NavigationProp = NativeStackNavigationProp<MainStackParamList>


interface Member {
  id: string
  uuid: string
  name: string
  picture?: string
}

export const GroupScreen = observer(function GroupScreen({ route }: any) {
  const { groupId } = route.params
  const { data: groupData, isLoading } = useGroupById(groupId)
  const [messages, setMessages] = useState<Message[]>([])
  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const [inputText, setInputText] = useState("")
  const flatListRef = useRef<FlatList>(null)
  const navigation = useNavigation<NavigationProp>()
  const { showToast } = useAppToast()
  const { sessionStore } = useStores()
  const {data} = useObtainToken()
  if(!sessionStore.supabase_token) {
    sessionStore.setSupabaseSession(data?.token || "", data?.expiresAt || new Date())
  }

  const { data: messagesData } = useGetChatMessages(groupId)
  
  const createMessageMutation = useCreateMessage()

  const getUserName = useCallback((userUuid: string) => {
    const member = groupData?.members.find(m => m.uuid === userUuid)
    return member?.name || userUuid 
  }, [groupData?.members])

  const handleNewMessage = useCallback((newMessage: any) => {
    const formattedMessage: Message = {
      id: newMessage.id.toString(),
      text: newMessage.content,
      sender: { 
        id: newMessage.user_id, 
        name: getUserName(newMessage.user_id),
        picture: groupData?.members.find(m => m.uuid === newMessage.user_id)?.picture
      },
      timestamp: new Date(newMessage.sent_at),
      isOwn: newMessage.user_id === sessionStore.user_uuid,
    }
    console.log("uuid", sessionStore.user_uuid)
    
    setMessages(prev => {
      const exists = prev.some(msg => msg.id === formattedMessage.id)
      if (exists) return prev
      
      return [...prev, formattedMessage]
    })
  }, [sessionStore.user_uuid, getUserName, groupData?.members])

  const { isSubscribed } = useMessageSubscription(groupId, handleNewMessage)

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages.map((message) => ({
        id: message.id.toString(),
        text: message.content,
        sender: { 
          id: message.user_id, 
          name: getUserName(message.user_id),
          picture: groupData?.members.find(m => m.uuid === message.user_id)?.picture
        },
        timestamp: new Date(message.sent_at),
        isOwn: message.user_id === sessionStore.user_uuid,
      })))
      
    console.log("uuid", sessionStore.user_uuid)
    }
  }, [messagesData, sessionStore.user_uuid, getUserName, groupData?.members])

  const sendMessage = () => {
    if (inputText.trim()) {
      createMessageMutation.mutate({
        groupId: parseInt(groupId),
        message: inputText.trim()
      })
      setInputText("") // Clear input after sending
    }
  }

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  return (
    <Screen
      preset="fixed"
      style={styles.container}
      contentContainerStyle={styles.container}
      backgroundColor={theme.colors.background}
      safeAreaEdges={["top", "bottom"]}
      keyboardOffset={spacing.lg}
    >
      <View style={styles.chatWrapper}>
        {/* Header */}
        <View style={[styles.header, $topInsets, themed(themedStyles.headerBackground)]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 10 }}
          >
            <Text style={themed(themedStyles.backButtonText)}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerInfo}
            onPress={() => navigation.navigate("GroupInfoScreen", { groupId })}
            activeOpacity={0.7}
          >
            <Text style={styles.groupIcon}>{groupData?.icon}</Text>
            <View style={styles.headerTextContainer}>
              <Text style={themed(themedStyles.groupName)}>{groupData?.name}</Text>
              <Text style={themed(themedStyles.memberCount)}>{groupData?.members.length} members</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <Text style={themed(themedStyles.headerActionText)}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Messages list */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }: { item: Message }) => <MessageBubble item={item} />}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input */}
        <View style={[styles.inputContainer, $bottomInsets, themed(themedStyles.inputContainerBackground)]}>
          <TextInput
            style={themed(themedStyles.textInput)}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textDim}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[themed(themedStyles.sendButton), !inputText.trim() && themed(themedStyles.sendButtonDisabled)]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
            activeOpacity={0.7}
          >
            <Text style={themed(themedStyles.sendButtonText)}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  )
})


// ---------------- STYLES ----------------

export const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  chatWrapper: { flex: 1 } as ViewStyle,

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  } as ViewStyle,

  backButton: { paddingRight: spacing.md } as ViewStyle,

  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,

  groupIcon: {
    fontSize: 32,
    lineHeight: 36,
    height: 36,
    textAlignVertical: "center",
    marginRight: spacing.sm,
  } as TextStyle,

  headerTextContainer: { flex: 1 } as ViewStyle,

  headerAction: { paddingLeft: spacing.md } as ViewStyle,

  messagesList: { flex: 1 } as ViewStyle,

  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  } as ViewStyle,

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  } as ViewStyle,

  membersList: { flex: 1 } as ViewStyle,

  memberAvatar: { marginRight: spacing.md } as ViewStyle,

  memberAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  } as ImageStyle,

})

export const themedStyles = {
  headerBackground: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.background,
    borderBottomColor: theme.colors.border,
  }),
  backButtonText: (theme: any): TextStyle => ({
    fontSize: 24,
    color: theme.colors.tint,
    fontWeight: "600",
  }),
  groupName: (theme: any): TextStyle => ({
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  }),
  memberCount: (theme: any): TextStyle => ({
    fontSize: 14,
    color: theme.colors.textDim,
    marginTop: 2,
  }),
  headerActionText: (theme: any): TextStyle => ({
    fontSize: 20,
    color: theme.colors.textDim,
    fontWeight: "600",
  }),
  inputContainerBackground: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.border,
  }),
  textInput: (theme: any): TextStyle => ({
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxHeight: 100,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.palette.neutral100,
  }),
  sendButton: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.tint,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  }),
  sendButtonDisabled: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.palette.neutral300,
  }),
  sendButtonText: (theme: any): TextStyle => ({
    color: theme.colors.tintInverse,
    fontSize: 18,
    fontWeight: "600",
  }),
  modalContainer: (theme: any): ViewStyle => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }),
  modalHeader: (theme: any): ViewStyle => ({
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  }),
  modalTitle: (theme: any): TextStyle => ({
    color: theme.colors.text,
  }),
  modalCloseText: (theme: any): TextStyle => ({
    color: theme.colors.tint,
    fontSize: 16,
    fontWeight: "600",
  }),
  groupInfoSection: (theme: any): ViewStyle => ({
    alignItems: "center",
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  }),
  modalGroupName: (theme: any): TextStyle => ({
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: spacing.sm,
  }),
  modalGroupLocation: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.textDim,
    marginTop: spacing.xs,
  }),
  modalGroupDescription: (theme: any): TextStyle => ({
    fontSize: 14,
    color: theme.colors.textDim,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  }),
  memberItem: (theme: any): ViewStyle => ({
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  }),
  memberAvatarPlaceholder: (theme: any): ViewStyle => ({
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.tint,
    justifyContent: "center",
    alignItems: "center",
  }),
  memberAvatarText: (theme: any): TextStyle => ({
    color: theme.colors.tintInverse,
    fontSize: 18,
    fontWeight: "600",
  }),
  memberName: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "500",
  }),
  leaveButton: (theme: any): ViewStyle => ({
    borderColor: theme.colors.error,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderRadius: spacing.md,
  }),
  leaveButtonText: (theme: any): TextStyle => ({
    color: theme.colors.error,
    fontWeight: "600",
  }),
  pressedLeaveButton: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.errorBackground,
  }),
  pressedLeaveButtonText: (theme: any): TextStyle => ({
    color: theme.colors.error,
    opacity: 0.9,
  }),
}
