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
  TextInput,
} from "react-native"
import { AutoImage, Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"

import { spacing } from "@/theme"
// ⚠️ UPDATED: Import PostCard and PostCardType from the new file
import { PostCard, PostCardType } from "@/components/Custom/PostCard" 
import { useCommunityById } from "@/hooks/Communities"

import { useStores } from "@/models"
import {
  useCreateCommunityPost,
  useInfiniteCommunityPosts,
  usePostSubscription,
  useUploadCommunityImage,
} from "@/hooks/Chats"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { MainStackParamList } from "@/navigators/MainNavigator"
import useImagePicker from "@/hooks/Image"

const ClipIcon = require("../../assets/images/clip.png")

const { height: screenHeight } = Dimensions.get("window")

type NavigationProp = NativeStackNavigationProp<MainStackParamList>

export const CommunityChatScreen = observer(function CommunityChatScreen({ route }: any) {
  const { communityId } = route.params
  const { data: communityData, isLoading } = useCommunityById(communityId)
  
  const [posts, setPosts] = useState<PostCardType[]>([]) 
  const { themed, theme } = useAppTheme()
  const $topInsets = useSafeAreaInsetsStyle(["top"])
  const $bottomInsets = useSafeAreaInsetsStyle(["bottom"])
  const [inputText, setInputText] = useState("")
  const flatListRef = useRef<FlatList>(null)
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>()
  const isFocused = useIsFocused()
  const { sessionStore } = useStores()

  const { imageUri, setImage, handleImagePicker } = useImagePicker()

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPosts,
  } = useInfiniteCommunityPosts(communityId, { pageSize: 30 })

  const { isPending: isSendingPost, mutateAsync: createPostAsync } = useCreateCommunityPost()
  const { isPending: isUploadingImage, mutateAsync: uploadMutateAsync } = useUploadCommunityImage()

  const membersMap = useMemo(() => {
    if (!communityData?.members) return new Map()
    return new Map(communityData.members.map((member) => [member.uuid, member]))
  }, [communityData?.members])

  // 🔐 Check if the current user is an admin
  const isCurrentUserAdmin = communityData?.is_admin ?? false

  const handleNewPost = useCallback(
    (newPost: any) => {
      const member = membersMap.get(newPost.user_id)
      const formattedPost: PostCardType = {
        id: newPost.id.toString(),
        text: newPost.content,
        sender: {
          id: newPost.user_id,
          name: member?.name || newPost.user_id,
          picture: member?.picture,
        },
        timestamp: new Date(newPost.sent_at),
        imageUrl: newPost.image_url || undefined,
      }

      setPosts((prev) => {
        const exists = prev.some((msg) => msg.id === formattedPost.id)
        if (exists) return prev
        // Add to the start (newest at top for non-inverted list)
        return [formattedPost, ...prev] 
      })
    },
    [membersMap],
  )

  usePostSubscription(communityId, handleNewPost, { enabled: isFocused })

  const formattedPosts = useMemo(() => {
    if (!infiniteData?.pages) return []
    const flat = infiniteData.pages.flatMap((p) => p.items)
    // Sort descending by ID (newest first) for a standard feed
    const sorted = [...flat].sort((a, b) => b.id - a.id)
    return sorted.map((post) => {
      const member = membersMap.get(post.user_id)
      return {
        id: post.id.toString(),
        text: post.content,
        sender: {
          id: post.user_id,
          name: member?.name || post.user_id,
          picture: member?.picture,
        },
        timestamp: new Date(post.sent_at),
        imageUrl: post.image_url || undefined,
      }
    })
  }, [infiniteData?.pages, membersMap])

  useEffect(() => {
    if (formattedPosts.length > 0) {
      setPosts(formattedPosts)
    }
  }, [formattedPosts])

  const sendPost = async () => {
    if (!isCurrentUserAdmin) return // Admin check

    let url = null
    if (imageUri) {
      url = await uploadMutateAsync({ communityId, uri: imageUri })
    }

    await createPostAsync({
      communityId: parseInt(communityId),
      post: inputText.trim(),
      imageUrl: url,
    })

    setInputText("")
    setImage(null)
  }

  if (isLoading || isLoadingPosts) {
    return <Text>Loading...</Text>
  }

  // Helper component for Post Input Area (only if admin)
  const PostInputArea = () => {
    if (!isCurrentUserAdmin) {
      return (
        <View style={[
            styles.inputContainer,
            $bottomInsets,
            themed(themedStyles.inputContainerBackground),
          ]}
        >
          <Text style={themed(themedStyles.nonAdminText)}>
            Only admins can post to this community.
          </Text>
        </View>
      )
    }

    const isDisabled = isSendingPost || isUploadingImage || (!imageUri && !inputText.trim())

    return (
      <>
        {imageUri && (
          <View style={styles.imagePreviewBar}>
            <AutoImage source={{ uri: imageUri }} style={styles.imagePreviewLarge} />
            <TouchableOpacity style={styles.removeImageButtonLarge} onPress={() => setImage(null)}>
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
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
            placeholder="Create a new post..."
            placeholderTextColor={theme.colors.textDim}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              themed(themedStyles.sendButton),
              isDisabled ? themed(themedStyles.sendButtonDisabled) : {},
            ]}
            onPress={sendPost}
            disabled={isDisabled}
            activeOpacity={0.7}
          >
            <Text style={themed(themedStyles.sendButtonText)}>→</Text>
          </TouchableOpacity>
        </View>
      </>
    )
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
            onPress={() => navigation.navigate("CommunityInfoScreen", { communityId })}
            activeOpacity={0.7}
          >
            {communityData?.avatar_url ? (
              <AutoImage source={{ uri: communityData?.avatar_url }} style={styles.communityAvatar} />
            ) : (
              <Text style={styles.communityIcon}>{communityData?.icon}</Text>
            )}

            <View style={styles.headerTextContainer}>
              <Text style={themed(themedStyles.communityName)}>{communityData?.name}</Text>
              <Text style={themed(themedStyles.memberCount)}>
                {communityData?.members.length} members
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <Text style={themed(themedStyles.headerActionText)}>⋮</Text>
          </TouchableOpacity>
        </View>
        
        {/* Posts List (No longer inverted) */}
        <FlatList
          ref={flatListRef}
          data={posts}
          renderItem={({ item }: { item: PostCardType }) => <PostCard item={item} />} 
          keyExtractor={(item) => item.id}
          style={styles.postsList} 
          contentContainerStyle={styles.postsContent} 
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5} 
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
          }}
        />

        <PostInputArea />
      </KeyboardAvoidingView>
    </View>
  )
})

// ------------------------------------------------
// 🎨 Styles
// ------------------------------------------------

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

  communityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 18,
    marginRight: spacing.sm,
  } as ImageStyle,

  communityIcon: {
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
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    minHeight: 60,
  } as ViewStyle,

  postsContent: { 
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  } as ViewStyle,

  postsList: { flex: 1 } as ViewStyle, 

  removeImageButtonLarge: {
    borderRadius: 15,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 10,
  },

  removeImageText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  }
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
  communityName: (theme: any): TextStyle => ({
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
  nonAdminText: (theme: any): TextStyle => ({
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    color: theme.colors.textDim,
    paddingHorizontal: spacing.md,
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