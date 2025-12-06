import React, { useState } from "react"
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
export const GroupMapIcon = ({ group }: { group: MapGroup }) => {
  const [imageError, setImageError] = useState(false)
  return (
    <View
      style={{
        width: 54,
        height: 54,
        borderRadius: 27,
        opacity: 1,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "white",
        overflow: "hidden",
      }}
    >
      {group.avatar_url && !imageError ? (
        <>
          <Image
            source={{ uri: group.avatar_url, cache: "force-cache" }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              position: "absolute",
            }}
            resizeMode="cover"
            onError={(e) => {
              console.warn(`GroupMapIcon failed to load image ${group.avatar_url}`, e.nativeEvent?.error || e)
              setImageError(true)
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 25,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 9,
                textAlign: "center",
              }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {group.name}
            </Text>
          </View>
        </>
      ) : (
        <View
          style={[
            getMarkerStyle(group),
            {
              width: 50,
              height: 50,
              borderRadius: 25,
              position: "absolute",
            },
          ]}
        >
          <Text style={{ fontSize: 16 }}>{group.icon ?? "G"}</Text>
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 10,
              textAlign: "center",
              marginTop: 2,
              maxWidth: 44,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {group.name}
          </Text>
        </View>
      )}
    </View>
  )
}
