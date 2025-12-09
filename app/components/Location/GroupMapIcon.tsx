import React, { useState, useEffect } from "react"
import { Image, View } from "react-native"
import { MapGroup } from "@/services/groups/Groups.types"
import { Text } from "../Text"

const getColorFromCoords = ([lng, lat]: [number, number]) => {
  // Simple hash function
  const hash = Math.abs(Math.sin(lng * 1000 + lat * 1000) * 10000)
  // Generate pastel color
  const r = Math.floor((hash % 128) + 127)
  const g = Math.floor(((hash / 2) % 128) + 127)
  const b = Math.floor(((hash / 3) % 128) + 127)
  return `rgb(${r},${g},${b})`
}
const getMarkerStyle = (marker: MapGroup) => ({
  backgroundColor: getColorFromCoords(marker.coords),
  borderRadius: 45,
  width: 65,
  height: 65,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  borderWidth: 2,
  borderColor: "white",
})
export const GroupMapIcon = ({ group, isCached, onImageCached }: { group: MapGroup, isCached?: boolean, onImageCached?: (url: string) => void }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const iconSize = 60
  const imageSize = iconSize - 4
  const borderRadius = iconSize / 2
  
  // If parent told us the image is cached, show it immediately
  useEffect(() => {
    if (isCached && group.avatar_url) {
      setImageLoaded(true)
      console.log(`[MARKER] Image already cached for ${group.id}`)
    }
  }, [])

  // If not cached, attempt local prefetch with retries and notify parent on success
  useEffect(() => {
    let mounted = true
    const attemptPrefetch = async () => {
      if (!group.avatar_url || isCached || imageError) return
      const maxRetries = 3
      for (let attempt = 0; attempt < maxRetries && mounted; attempt++) {
        try {
          await Image.prefetch(group.avatar_url)
          if (!mounted) return
          console.log(`[MARKER] Prefetch succeeded for ${group.id}`)
          setImageLoaded(true)
          onImageCached?.(group.avatar_url)
          return
        } catch (err) {
          if (attempt < maxRetries - 1) {
            await new Promise((res) => setTimeout(res, 500 * (attempt + 1)))
          }
        }
      }
      if (mounted) setImageError(true)
    }
    attemptPrefetch()
    return () => { mounted = false }
  }, [])

  return (
    <View
      style={{
        width: iconSize,
        height: iconSize,
        borderRadius: borderRadius,
        opacity: 1,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "white",
        overflow: "hidden",
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      {group.avatar_url && !imageError && imageLoaded ? (
        <Image
          source={{ uri: group.avatar_url, cache: "force-cache" }}
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: borderRadius - 2,
          }}
          resizeMode="cover"
          onError={() => {
            console.error(`[MARKER] Image render failed for group ${group.id}: ${group.avatar_url}`)
            setImageLoaded(false)
            // Try local prefetch again if the parent didn't cache it yet
            setTimeout(async () => {
              if (!group.avatar_url) return
              try {
                await Image.prefetch(group.avatar_url)
                console.log(`[MARKER] Re-prefetch succeeded for ${group.id}`)
                setImageLoaded(true)
                onImageCached?.(group.avatar_url)
              } catch (err) {
                setImageError(true)
              }
            }, 400)
          }}
          onLoad={() => {
            console.log(`[MARKER] Image loaded in element for ${group.id}`)
            setImageLoaded(true)
          }}
        />
      ) : (
        <View
          style={[
            getMarkerStyle(group),
            {
              width: imageSize,
              height: imageSize,
              borderRadius: borderRadius - 2,
            },
          ]}
        >
          <Text style={{ fontSize: 24 }}>{group.icon ?? "📍"}</Text>
        </View>
      )}
    </View>
  )
}
