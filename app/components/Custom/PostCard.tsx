import React, { useMemo } from "react"
import { View, StyleSheet, type ViewStyle, type TextStyle, type ImageStyle, Dimensions } from "react-native"
import { AutoImage, Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"

const { width } = Dimensions.get("window")

// Define the type for a Post item
export interface PostCardType {
  id: string
  text: string
  sender: {
    id: string
    name: string
    picture?: string
  }
  timestamp: Date
  imageUrl?: string
}

interface PostCardProps {
  item: PostCardType
}

export const PostCard = ({ item }: PostCardProps) => {
  const { themed, theme } = useAppTheme()

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
      // Use XOR for distribution
      hash = ((hash << 5) - hash) + userId.charCodeAt(i) | 0; 
    }
    const colorIndex = Math.abs(hash) % colors.length
    
    return colors[colorIndex]
  }

  const formattedTime = useMemo(() => {
    const now = new Date()
    const messageDate = new Date(item.timestamp)
    
    const isToday = 
      messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear()
    
    if (isToday) {
      return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      // For a post card, we show more context (e.g., Oct 27 at 8:28 PM)
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })
    }
  }, [item.timestamp])


  // --- Render ---
  return (
    <View style={[styles.container, themed(themedStyles.cardBackground)]}>
      {/* 1. Header (Sender Info) */}
      <View style={styles.header}>
        <View style={styles.senderAvatarPlaceholder}>
            {item.sender.picture ? (
            <AutoImage source={{ uri: item.sender.picture }} style={styles.avatar} />
            ) : (
            <Text style={themed(themedStyles.avatarLetter)}>{item.sender.name.charAt(0)}</Text>
            )}
        </View>
        <View style={styles.headerTextContainer}>
            <Text 
                style={[
                    themed(themedStyles.senderName), 
                    { color: getUserColor(item.sender.id) }
                ]} 
                numberOfLines={1}
            >
                {item.sender.name}
            </Text>
            <Text style={themed(themedStyles.timestamp)}>{formattedTime}</Text>
        </View>
      </View>

      {/* 2. Text Content */}
      {item.text.length > 0 && (
        <View style={styles.contentContainer}>
            <Text style={themed(themedStyles.postText)}>{item.text}</Text>
        </View>
      )}

      {/* 3. Image Content */}
      {item.imageUrl && (
        // The image is displayed after the text in a post feed
        <View style={styles.imageContainer}>
          <AutoImage source={{ uri: item.imageUrl }} style={styles.postImage} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    // Slight max width to keep the card visually appealing
    maxWidth: width * 0.95, 
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  } as ViewStyle,

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    paddingBottom: spacing.xs,
  } as ViewStyle,

  senderAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    backgroundColor: '#eee', 
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  } as ImageStyle,

  headerTextContainer: {
    flex: 1,
  } as ViewStyle,

  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  } as ViewStyle,

  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9, 
    overflow: 'hidden',
    // Apply border radius only to the bottom edges of the card
    borderBottomLeftRadius: spacing.lg, 
    borderBottomRightRadius: spacing.lg,
  },

  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  } as ImageStyle,
})

const themedStyles = {
  cardBackground: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.palette.white, 
    borderColor: theme.colors.border,
    borderWidth: 1,
  }),
  senderName: (_theme: any): TextStyle => ({
    fontSize: 14, // Slightly smaller than message text for header
    fontWeight: "700", // Stronger bold for emphasis
  }),
  timestamp: (theme: any): TextStyle => ({
    fontSize: 12,
    color: theme.colors.textDim,
  }),
  postText: (theme: any): TextStyle => ({
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
  }),
  avatarLetter: (theme: any): TextStyle => ({
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.tintInverse, // assuming tintInverse is white/dark
  })
}