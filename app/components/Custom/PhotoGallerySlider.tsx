import { observer } from "mobx-react-lite"
import {
  View,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native"
import { Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { spacing } from "@/theme"

import Animated from "react-native-reanimated"

const { width } = Dimensions.get("window")

export interface PhotoItem {
  id: string
  image: any
  title: string
  subtitle?: string
}

export interface PhotoGallerySliderProps {
  data: PhotoItem[]
  title?: string
  onItemPress?: (item: PhotoItem) => void
  itemWidth?: number
  showSubtitle?: boolean
}

export const PhotoGallerySlider = observer(function PhotoGallerySlider({
  data,
  title = "",
  onItemPress,
  itemWidth = width * 0.4,
  showSubtitle = true,
}: PhotoGallerySliderProps) {
  const { themed, theme } = useAppTheme()

  const handleItemPress = (item: PhotoItem) => {
    if (onItemPress) {
      onItemPress(item)
    } else {
      console.log("Photo pressed:", item.title)
    }
  }

  const renderPhotoItem = ({ item, index }: { item: PhotoItem; index: number }) => {
    const isFirst = index === 0
    const isLast = index === data.length - 1

    return (
      <TouchableOpacity
        style={[
          $photoItemContainer,
          { width: itemWidth },
          isFirst && $firstItem,
          isLast && $lastItem,
        ]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
      >
        <View style={themed($photoCard)}>
          <Animated.Image
            source={{ uri: item.image }}
            style={[themed($photoImage), { width: itemWidth }]}
            // sharedTransitionTag={item.id} // Comentado temporalmente para evitar crashes
          />
          <View style={themed($photoOverlay)}>
            <View style={themed($gradientOverlay)} />
          </View>
        </View>

        <View style={$photoInfo}>
          <Text style={themed($photoTitle)} numberOfLines={1}>
            {item.title}
          </Text>
          {showSubtitle && item.subtitle && (
            <Text style={themed($photoSubtitle)} numberOfLines={2}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={$container}>
      {title && (
        <View style={$headerContainer}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            {title}
          </Text>
        </View>
      )}

      <FlatList
        data={data}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={$listContainer}
        snapToInterval={itemWidth + spacing.md}
        decelerationRate="fast"
        snapToAlignment="start"
        scrollEventThrottle={16}
      />
    </View>
  )
})

const $container: ViewStyle = {}

const $headerContainer: ViewStyle = {
  // paddingHorizontal: spacing.md,
  marginBottom: spacing.md,
}

const $sectionTitle = (theme: any): TextStyle => ({
  color: theme.colors.text,
  fontWeight: "700",
  fontSize: 20,
})

const $listContainer: ViewStyle = {
  // paddingLeft: spacing.sm,
}

const $photoItemContainer: ViewStyle = {
  marginRight: spacing.md,
}

const $firstItem: ViewStyle = {
  marginLeft: 0,
}

const $lastItem: ViewStyle = {
  marginRight: spacing.lg,
}

const $photoCard = (theme: any): ViewStyle => ({
  borderRadius: spacing.md,
  overflow: "hidden",
  shadowColor: theme.colors.palette.neutral900,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 6,
  backgroundColor: theme.colors.background,
})

const $photoImage = (theme: any): ImageStyle => ({
  height: width * 0.4,
  borderRadius: spacing.md,
  backgroundColor: theme.colors.backgroundMuted,
})

const $photoOverlay: ViewStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "40%",
  borderBottomLeftRadius: spacing.md,
  borderBottomRightRadius: spacing.md,
}

const $gradientOverlay = (theme: any): ViewStyle => ({
  flex: 1,
  backgroundColor: "transparent",
})

const $photoInfo: ViewStyle = {
  paddingTop: spacing.sm,
  paddingHorizontal: spacing.xs,
}

const $photoTitle = (theme: any): TextStyle => ({
  fontSize: 16,
  fontWeight: "600",
  color: theme.colors.text,
  marginBottom: spacing.xs,
})

const $photoSubtitle = (theme: any): TextStyle => ({
  fontSize: 14,
  color: theme.colors.textDim,
  fontWeight: "400",
})
