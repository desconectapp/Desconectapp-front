import { observer } from "mobx-react-lite"
import { useState, useRef } from "react"
import {
  View,
  type ViewStyle,
  type TextStyle,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Image,
  type ImageStyle,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import { MessageBubble, Message } from "@/components/Custom/Message"

interface Member {
  id: string
  name: string
  picture?: string
}

interface GroupData {
  id: string
  name: string
  description: string
  created_at: string
  activity: string
  icon: string
  location: string
  members: Member[]
}

const mockGroupData: GroupData = {
  id: "group123",
  name: "Futbol Martinez",
  description: "A group for discussing study materials",
  created_at: "2023-10-01T12:00:00Z",
  activity: "Football",
  icon: "⚽",
  location: "Madrid, Spain",
  members: [
    { id: "user123", name: "John Doe" },
    { id: "user456", name: "Maria Garcia" },
    { id: "user789", name: "Carlos Rodriguez" },
    { id: "user101", name: "Ana Lopez" },
    { id: "currentUser", name: "You" },
  ],
}

const mockMessages: Message[] = [
  {
    id: "1",
    text: "Hey everyone! Ready for tomorrow's match?",
    sender: { id: "user123", name: "John Doe", picture: "https://example.com/profile/johndoe.jpg" },
    timestamp: "2023-10-01T10:30:00Z",
    isOwn: false,
  },
  {
    id: "2",
    text: "What time are we meeting?",
    sender: { id: "currentUser", name: "You" },
    timestamp: "2023-10-01T10:32:00Z",
    isOwn: true,
  },
  {
    id: "3",
    text: "Let's meet at 3 PM at the usual spot",
    sender: { id: "user456", name: "Maria Garcia" },
    timestamp: "2023-10-01T10:35:00Z",
    isOwn: false,
  },
  {
    id: "4",
    text: "Perfect! See you all there",
    sender: { id: "currentUser", name: "You" },
    timestamp: "2023-10-01T10:36:00Z",
    isOwn: true,
  },
]

export const GroupScreen = observer(function GroupScreen({ route }: any) {
  const { groupId } = route.params

  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputText, setInputText] = useState("")
  const [showMembers, setShowMembers] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const navigation = useNavigation()
  const { showToast } = useAppToast()

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: { id: "currentUser", name: "You" },
        timestamp: new Date().toISOString(),
        isOwn: true,
      }

      setMessages((prev) => [...prev, newMessage])
      setInputText("")

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }

  const renderMember = ({ item }: { item: Member }) => (
    <View style={themed($memberItem)}>
      <View style={$memberAvatar}>
        {item.picture ? (
          <Image source={{ uri: item.picture }} style={$memberAvatarImage} />
        ) : (
          <View style={themed($memberAvatarPlaceholder)}>
            <Text style={themed($memberAvatarText)}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <Text style={themed($memberName)}>{item.name}</Text>
    </View>
  )

  return (
    <View style={$container}>
      <KeyboardAvoidingView
        style={$container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[$header, $topInsets, themed($headerBackground)]}>
          <TouchableOpacity
            style={$backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 10 }}
          >
            <Text style={themed($backButtonText)}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={$headerInfo}
            onPress={() => setShowMembers(true)}
            activeOpacity={0.7}
          >
            <Text style={$groupIcon}>{mockGroupData.icon}</Text>
            <View style={$headerTextContainer}>
              <Text style={themed($groupName)}>{mockGroupData.name}</Text>
              <Text style={themed($memberCount)}>{mockGroupData.members.length} members</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={$headerAction} activeOpacity={0.7}>
            <Text style={themed($headerActionText)}>⋮</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }: { item: Message }) => {
            return <MessageBubble item={item} />
          }}
          keyExtractor={(item) => item.id}
          style={$messagesList}
          contentContainerStyle={$messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={[$inputContainer, $bottomInsets, themed($inputContainerBackground)]}>
          <TextInput
            style={themed($textInput)}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textDim}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[themed($sendButton), !inputText.trim() && themed($sendButtonDisabled)]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
            activeOpacity={0.7}
          >
            <Text style={themed($sendButtonText)}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showMembers} animationType="slide" presentationStyle="pageSheet">
        <View style={[themed($modalContainer), $topInsets]}>
          <TouchableOpacity onPress={() => setShowMembers(false)} activeOpacity={0.7}>
            <View style={themed($modalHeader)}>
              <Text preset="heading" style={themed($modalTitle)}>
                Group Members
              </Text>
              <Text style={themed($modalCloseText)}>Done</Text>
            </View>
          </TouchableOpacity>

          <View style={themed($groupInfoSection)}>
            <Text style={$groupIcon}>{mockGroupData.icon}</Text>
            <Text style={themed($modalGroupName)}>{mockGroupData.name}</Text>
            <Text style={themed($modalGroupLocation)}>{mockGroupData.location}</Text>
            <Text style={themed($modalGroupDescription)}>{mockGroupData.description}</Text>
          </View>

          <FlatList
            data={mockGroupData.members}
            renderItem={renderMember}
            keyExtractor={(item) => item.id}
            style={$membersList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  )
})

const $container: ViewStyle = {
  flex: 1,
}

const $header: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
}

const $headerBackground = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.background,
  borderBottomColor: theme.colors.border,
})

const $backButton: ViewStyle = {
  paddingRight: spacing.md,
}

const $backButtonText = (theme: any): TextStyle => ({
  fontSize: 24,
  color: theme.colors.tint,
  fontWeight: "600",
})

const $headerInfo: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
}

const $groupIcon: TextStyle = {
  fontSize: 32,
  lineHeight: 36,
  height: 36,
  textAlignVertical: "center",
  marginRight: spacing.sm,
}

const $headerTextContainer: ViewStyle = {
  flex: 1,
}

const $groupName = (theme: any): TextStyle => ({
  fontSize: 18,
  fontWeight: "600",
  color: theme.colors.text,
})

const $memberCount = (theme: any): TextStyle => ({
  fontSize: 14,
  color: theme.colors.textDim,
  marginTop: 2,
})

const $headerAction: ViewStyle = {
  paddingLeft: spacing.md,
}

const $headerActionText = (theme: any): TextStyle => ({
  fontSize: 20,
  color: theme.colors.textDim,
  fontWeight: "600",
})

const $messagesList: ViewStyle = {
  flex: 1,
}

const $messagesContent: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
}

const $inputContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-end",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderTopWidth: 1,
}

const $inputContainerBackground = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.background,
  borderTopColor: theme.colors.border,
})

const $textInput = (theme: any): TextStyle => ({
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
})

const $sendButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  width: 44,
  height: 44,
  borderRadius: 22,
  justifyContent: "center",
  alignItems: "center",
})

const $sendButtonDisabled = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.palette.neutral300,
})

const $sendButtonText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontSize: 18,
  fontWeight: "600",
})

const $modalContainer = (theme: any): ViewStyle => ({
  flex: 1,
  backgroundColor: theme.colors.background,
})

const $modalHeader = (theme: any): ViewStyle => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
})

const $modalTitle = (theme: any): TextStyle => ({
  color: theme.colors.text,
})

const $modalCloseText = (theme: any): TextStyle => ({
  color: theme.colors.tint,
  fontSize: 16,
  fontWeight: "600",
})

const $groupInfoSection = (theme: any): ViewStyle => ({
  alignItems: "center",
  paddingVertical: spacing.xl,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
})

const $modalGroupName = (theme: any): TextStyle => ({
  fontSize: 24,
  fontWeight: "bold",
  color: theme.colors.text,
  marginTop: spacing.sm,
})

const $modalGroupLocation = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.textDim,
  marginTop: spacing.xs,
})

const $modalGroupDescription = (theme: any): TextStyle => ({
  fontSize: 14,
  color: theme.colors.textDim,
  textAlign: "center",
  marginTop: spacing.sm,
  paddingHorizontal: spacing.lg,
})

const $membersList: ViewStyle = {
  flex: 1,
}

const $memberItem = (theme: any): ViewStyle => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
})

const $memberAvatar: ViewStyle = {
  marginRight: spacing.md,
}

const $memberAvatarImage: ImageStyle = {
  width: 50,
  height: 50,
  borderRadius: 25,
}

const $memberAvatarPlaceholder = (theme: any): ViewStyle => ({
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: theme.colors.tint,
  justifyContent: "center",
  alignItems: "center",
})

const $memberAvatarText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontSize: 18,
  fontWeight: "600",
})

const $memberName = (theme: any): TextStyle => ({
  fontSize: 16,
  color: theme.colors.text,
  fontWeight: "500",
})
