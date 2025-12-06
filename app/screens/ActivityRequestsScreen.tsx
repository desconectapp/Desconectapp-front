import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  Dimensions, 
  type ViewStyle, 
  type TextStyle 
} from "react-native"
import { Screen, Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { ActivityRequestsList } from "@/components/Custom/ActivitiesRequestList"
import { containers, texts } from "@/theme/commonStyles"
import { spacing } from "@/theme"

const { width, height } = Dimensions.get("window")

export const ActivityRequestsScreen = observer(function ActivityRequestsScreen() {
  const { themed, theme } = useAppTheme()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  const modalStyles = createModalStyles(theme)

  const handleItemPress = (item: any) => {
    setSelectedRequest(item)
    setModalVisible(true)
  }

  const handleCancelRequest = () => {
    // TODO: Implement cancel request logic
    console.log("Canceling request(TODO):", selectedRequest)
    setModalVisible(false)
    setSelectedRequest(null)
  }

  return (
    <Screen
      preset="fixed"
      // asegurar que Screen ocupe toda la pantalla para que los hijos con flex:1 funcionen
      style={$screen}
      contentContainerStyle={[containers.screen, $container]}
      backgroundColor={themed(() => theme.colors.background)}
    >
      {/* Header */}
      <Text preset="heading" style={[themed(texts.heading), $title]}>
        Mis Búsquedas
      </Text>

      {/* Activity Requests List: darle un wrapper con flex:1 para que FlatList tenga altura */}
      <View style={$listWrapper}>
        <ActivityRequestsList onItemPress={handleItemPress} />
      </View>

      {/* Cancel Request Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalHeader}>
              <Text style={themed(modalStyles.modalTitle)}>
                ¿Seguro que querés cancelar esta búsqueda?
              </Text>
              <TouchableOpacity
                style={modalStyles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={modalStyles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={modalStyles.modalBody}>
              <Text style={themed(modalStyles.modalContent)}>
                Si cancelás esta búsqueda, no vas a recibir más notificaciones sobre posibles coincidencias.
              </Text>
              
              <View style={modalStyles.modalFooter}>
                <TouchableOpacity
                  style={modalStyles.modalSecondaryButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={modalStyles.modalSecondaryButtonText}>
                    Mantener búsqueda
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={modalStyles.modalDangerButton}
                  onPress={handleCancelRequest}
                >
                  <Text style={modalStyles.modalDangerButtonText}>
                    Cancelar búsqueda
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingBottom: spacing.lg,
}

const $screen: ViewStyle = {
  flex: 1,
}

const $listWrapper: ViewStyle = {
  flex: 1,
}

const $title: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.lg,
}

const createModalStyles = (theme: any) => ({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  } as ViewStyle,

  modalContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: spacing.lg,
    width: "100%",
    maxWidth: width * 0.9,
    elevation: 10,
    padding: spacing.lg,
  } as ViewStyle,

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  } as ViewStyle,

  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
    marginRight: spacing.sm,
  } as TextStyle,

  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.palette.neutral200,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  modalCloseText: {
    fontSize: 18,
    color: theme.colors.textDim,
    fontWeight: "500",
  } as TextStyle,

  modalBody: {
    paddingBottom: spacing.md,
  } as ViewStyle,

  modalContent: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  } as TextStyle,

  modalFooter: {
    flexDirection: "row",
    gap: spacing.md,
  } as ViewStyle,

  modalSecondaryButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,

  modalSecondaryButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,

  modalDangerButton: {
    flex: 1,
    backgroundColor: theme.colors.error,
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,

  modalDangerButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,
})
