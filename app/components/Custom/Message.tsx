import { View, type ViewStyle, type TextStyle, Dimensions } from "react-native"
import { Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"

const { width } = Dimensions.get("window")

export interface Message {
  id: string
  text: string
  sender: {
    id: string
    name: string
    picture?: string
  }
  timestamp: Date
  isOwn: boolean
}

export const MessageBubble = ({ item }: { item: Message }) => {
  const { themed } = useAppTheme()

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <View style={item.isOwn ? $ownMessageContainer : $otherMessageContainer}>
      {!item.isOwn && (
        <View style={$senderInfo}>
          <Text style={themed($senderName)}>{item.sender.name}</Text>
        </View>
      )}
      <View
        style={[
          themed($messageBubble),
          item.isOwn ? themed($ownMessageBubble) : themed($otherMessageBubble),
        ]}
      >
        <Text
          style={[
            themed($messageText),
            item.isOwn ? themed($ownMessageText) : themed($otherMessageText),
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            themed($messageTime),
            item.isOwn ? themed($ownMessageTime) : themed($otherMessageTime),
          ]}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  )
}

const $ownMessageContainer: ViewStyle = {
  alignItems: "flex-end",
  marginVertical: spacing.xs,
}

const $otherMessageContainer: ViewStyle = {
  alignItems: "flex-start",
  marginVertical: spacing.xs,
}

const $senderInfo: ViewStyle = {
  marginBottom: spacing.xs,
  marginLeft: spacing.sm,
}

const $senderName = (theme: any): TextStyle => ({
  fontSize: 12,
  color: theme.colors.textDim,
  fontWeight: "500",
})

const $messageBubble: ViewStyle = {
  maxWidth: width * 0.75,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: spacing.md,
}

const $ownMessageBubble = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
})

const $otherMessageBubble = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.palette.neutral200,
  borderColor: theme.colors.border,
  borderWidth: 1,
})

const $messageText: TextStyle = {
  fontSize: 16,
  lineHeight: 20,
}

const $ownMessageText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
})

const $otherMessageText = (theme: any): TextStyle => ({
  color: theme.colors.text,
})

const $messageTime: TextStyle = {
  fontSize: 11,
  alignSelf: "flex-end",
}

const $ownMessageTime = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  opacity: 0.7,
})

const $otherMessageTime = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
})
