import { View, type ViewStyle, type TextStyle, Dimensions, ImageStyle } from "react-native"
import { AutoImage, Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"

const { width } = Dimensions.get("window")

export interface MessageBubbleType {
  id: string
  text: string
  sender: {
    id: string
    name: string
    picture?: string
  }
  timestamp: Date
  isOwn: boolean
  imageUrl?: string
  isSystem?: boolean
}

export const MessageBubble = ({ item }: { item: MessageBubbleType }) => {
  const { themed } = useAppTheme()

  const getUserColor = (userId: string) => {
    const colors = [
      "#84994F", 
      "#FCB53B", 
      "#B45253", 
      "#6B7A3F", 
      "#E3A235", 
      "#A24849",
      "#D1DDB8", 
      "#E5CCCC", 
    ]
    
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash += userId.charCodeAt(i)
    }
    const colorIndex = hash % colors.length
    const selectedColor = colors[colorIndex]
    
    return selectedColor
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const messageDate = new Date(timestamp)
    
    const isToday = 
      messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear()
    
    if (isToday) {
      return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return messageDate.toLocaleDateString([], { 
        month: "short", 
        day: "numeric",
        hour: "2-digit", 
        minute: "2-digit" 
      })
    }
  }

  // System message rendering
  if (item.isSystem) {
    return (
      <View style={$systemMessageContainer}>
        <View style={themed($systemMessageBubble)}>
          <Text style={themed($systemMessageText)}>
            {item.text}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={item.isOwn ? $ownMessageContainer : $otherMessageContainer}>
      {!item.isOwn && (
        <View style={$senderInfo}>
          <Text style={[themed($senderName), { color: getUserColor(item.sender.id) }]}>
            {item.sender.name}
          </Text>
        </View>
      )}
      <View
        style={[
          themed($messageBubble),
          item.isOwn ? themed($ownMessageBubble) : themed($otherMessageBubble),
        ]}
      >
        {item.imageUrl && <AutoImage source={{ uri: item.imageUrl }} style={themed($image)} />}
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

const $senderName = (_theme: any): TextStyle => ({
  fontSize: 12,
  fontWeight: "600", // Made it slightly bolder to make the colors pop
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

const $image = (_: any): ImageStyle => ({
  height: 250,
  width: 250,
  borderRadius: spacing.md,
  marginBottom: spacing.sm,
})

const $systemMessageContainer: ViewStyle = {
  alignItems: "center",
  marginVertical: spacing.md,
}

const $systemMessageBubble = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.palette.primary200, // Light green highlight color
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: spacing.md,
  maxWidth: width * 0.85,
  borderWidth: 1,
  borderColor: theme.colors.palette.primary300,
})

const $systemMessageText = (theme: any): TextStyle => ({
  fontSize: 14,
  color: theme.colors.palette.primary600, // Darker green for text
  textAlign: "center",
  fontStyle: "italic",
  fontWeight: "500",
})
