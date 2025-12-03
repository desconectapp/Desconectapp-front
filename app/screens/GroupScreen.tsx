import { observer } from "mobx-react-lite"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import {
  View,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
  Dimensions,
  // eslint-disable-next-line no-restricted-imports
  TextInput,
} from "react-native"
import { AutoImage, Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"

import { spacing } from "@/theme"
import { MessageBubble, MessageBubbleType } from "@/components/Custom/Message"
import { useGroupById } from "@/hooks/Groups"

import { useStores } from "@/models"
import {
  useCreateMessage,
  useInfiniteChatMessages,
  useMarkAsSeen,
  useMessageSubscription,
  useUploadGroupImage,
} from "@/hooks/Chats"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { MainStackParamList } from "@/navigators/MainNavigator"
import useImagePicker from "@/hooks/Image"

const ClipIcon = require("../../assets/images/clip.png")

const { height: screenHeight } = Dimensions.get("window")

type NavigationProp = NativeStackNavigationProp<MainStackParamList>

export const GroupScreen = observer(function GroupScreen({ route }: any) {
  const { groupId, placeholderGroupData } = route.params

  const { data: groupData, isLoading } = useGroupById(groupId, placeholderGroupData)
  const [messages, setMessages] = useState<MessageBubbleType[]>([])
  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const [inputText, setInputText] = useState("")
  const flatListRef = useRef<FlatList>(null)
  const navigation = useNavigation<NavigationProp>()
  const isFocused = useIsFocused()
  const { sessionStore } = useStores()

  const { imageUri, setImage, handleImagePicker } = useImagePicker()

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages,
  } = useInfiniteChatMessages(groupId, { pageSize: 30 })

  const { mutateAsync: markAsSeenAsync } = useMarkAsSeen(sessionStore.user_uuid)

  const { isPending: isSendingMessage, mutateAsync: createMessageAsync } = useCreateMessage()
  const { isPending: isUploadingImage, mutateAsync: uploadMutateAsync } = useUploadGroupImage()

  // Memoize the members map for better performance
  const membersMap = useMemo(() => {
    if (!groupData?.members)  { 
        return new Map() 
    }
    return new Map(groupData.members.map((member) => [member.uuid, member]))
  }, [groupData?.members])

  useEffect(() => {
    markAsSeenAsync(groupId)
  }, [infiniteData, groupId, markAsSeenAsync])

  const handleNewMessage = useCallback(
    (newMessage: any) => {
      const member = membersMap.get(newMessage.user_id)
      const formattedMessage: MessageBubbleType = {
        id: newMessage.id.toString(),
        text: newMessage.content,
        sender: {
          id: newMessage.user_id,
          name: member?.name || newMessage.user_id,
          picture: member?.picture,
        },
        timestamp: new Date(newMessage.sent_at),
        isOwn: newMessage.user_id === sessionStore.user_uuid,
        imageUrl: newMessage.image_url || undefined,
      }

      markAsSeenAsync(groupId)

      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === formattedMessage.id)
        if (exists) return prev
        return [...prev, formattedMessage]
      })
    },
    [sessionStore.user_uuid, membersMap],
  )

  useMessageSubscription(groupId, handleNewMessage, { enabled: isFocused })

  const formattedMessages = useMemo(() => {
    if (!infiniteData?.pages) return []
    const flat = infiniteData.pages.flatMap((p) => p.items)
    // Sort descending so newest comes first in data; with FlatList inverted, newest stays at bottom visually
    const sorted = [...flat].sort((a, b) => b.id - a.id)
    return sorted.map((message) => {
      const member = membersMap.get(message.user_id)
      return {
        id: message.id.toString(),
        text: message.content,
        sender: {
          id: message.user_id,
          name: member?.name || message.user_id,
          picture: member?.picture,
        },
        timestamp: new Date(message.sent_at),
        isOwn: message.user_id === sessionStore.user_uuid,
        imageUrl: message.image_url || undefined,
      }
    })
  }, [infiniteData?.pages, membersMap, sessionStore.user_uuid])

  useEffect(() => {
    if (formattedMessages.length > 0) {
      setMessages(formattedMessages)
    }
  }, [formattedMessages])

  const sendMessage = async () => {
    let url = null
    if (imageUri) {
      url = await uploadMutateAsync({ groupId, uri: imageUri })
    }

    await createMessageAsync({
      groupId: parseInt(groupId),
      message: inputText.trim(),
      imageUrl: url,
    })

    setInputText("")
    setImage(null)
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
    })
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
            {groupData?.avatar_url ? (
              <AutoImage source={{ uri: groupData?.avatar_url }} style={styles.groupAvatar} />
            ) : (
              <Text style={styles.groupIcon}>{groupData?.icon}</Text>
            )}

            <View style={styles.headerTextContainer}>
              <Text style={themed(themedStyles.groupName)}>{groupData?.name}</Text>
              <Text style={themed(themedStyles.memberCount)}>
                {groupData?.members?.length} miembros
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <Text style={themed(themedStyles.headerActionText)}>⋮</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }: { item: MessageBubbleType }) => <MessageBubble item={item} />}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          inverted
          maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
          onEndReachedThreshold={0.2}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
          }}
        />

        {imageUri && (
          <View style={styles.imagePreviewBar}>
            <AutoImage source={{ uri: imageUri }} style={styles.imagePreviewLarge} />
            <TouchableOpacity style={styles.removeImageButtonLarge} onPress={() => setImage(null)}>
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            $bottomInsets,
            themed(themedStyles.inputContainerBackground),
          ]}
        >
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleImagePicker}
            activeOpacity={0.7}
          >
            <AutoImage source={ClipIcon} style={styles.attachIcon} />
          </TouchableOpacity>

          <TextInput
            style={themed(themedStyles.textInput)}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={theme.colors.textDim}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              themed(themedStyles.sendButton),
              !isSendingMessage && !isUploadingImage && !imageUri && !inputText.trim()
                ? themed(themedStyles.sendButtonDisabled)
                : {},
            ]}
            onPress={sendMessage}
            disabled={!isSendingMessage && !isUploadingImage && !imageUri && !inputText.trim()}
            activeOpacity={0.7}
          >
            <Text style={themed(themedStyles.sendButtonText)}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
})

export const styles = StyleSheet.create({
  attachButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    marginRight: spacing.sm,
    width: 40,
  },

  attachIcon: {
    height: 20,
    resizeMode: "contain",
    width: 20,
  },

  backButton: { paddingRight: spacing.md } as ViewStyle,

  container: { flex: 1 } as ViewStyle,

  groupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 18,
    marginRight: spacing.sm,
  } as ImageStyle,

  groupIcon: {
    fontSize: 32,
    lineHeight: 36,
    height: 36,
    textAlignVertical: "center",
    marginRight: spacing.sm,
  } as TextStyle,

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  } as ViewStyle,

  headerAction: { paddingLeft: spacing.md } as ViewStyle,

  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,

  headerTextContainer: { flex: 1 } as ViewStyle,

  imagePreviewBar: {
    backgroundColor: "rgba(0,0,0,0.3)",
    height: screenHeight * 0.2,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },

  imagePreviewLarge: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: "100%",
    resizeMode: "contain",
    width: "100%",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  } as ViewStyle,

  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  } as ViewStyle,

  messagesList: { flex: 1 } as ViewStyle,

  removeImageButtonLarge: {
    borderRadius: 15,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 10,
  },
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
  imagePreviewBarBackground: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.overlay20,
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
}
