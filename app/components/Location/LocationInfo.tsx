import { TouchableOpacity, StyleSheet } from "react-native"
import { View } from "tamagui"
import { Text } from "../Text"
import { ReactNode } from "react"

export const LocationInfo = ({
    children,
    height = 100,
}: {
    children: ReactNode
    height?: number | string
}) => {
    return (
        <View style={styles.bottomOverlayContainer}>
            <View style={[styles.gradientOverlay, { height }]} />
            <View style={styles.selectedMarkerInfo}>
                <View style={{ position: "absolute", top: 0, right: 0, zIndex: 10 }}>
                    <TouchableOpacity
                        style={{
                            margin: 8,
                            backgroundColor: "rgba(155, 155, 155, 0.32)",
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            alignItems: "center",
                            right: -80,
                            top: 35,
                        }}
                    >
                        <Text style={{ color: "white", fontSize: 18 }}>x</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 32, alignItems: "center" }}>
                    {children}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerEmoji: {
    fontSize: 16,
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  bottomOverlayContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 100,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  gradientOverlay: {
    position: "absolute",
    left: 5,
    right: 5,
    bottom: 2.5,
    height: 100,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  selectedMarkerInfo: {
    padding: 16,
    alignItems: "center",
    zIndex: 2,
  },
})