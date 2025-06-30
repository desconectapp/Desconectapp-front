import { Toast, ToastProvider, ToastViewport, useToastState } from "@tamagui/toast"
import { YStack } from "tamagui"

export const AppToast = () => {
  const currentToast = useToastState()

  if (!currentToast || currentToast.isHandledNatively) return null

  return (
    <Toast
      animation="200ms"
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, transform: [{ translateY: 100 }] }}
      exitStyle={{ opacity: 0, transform: [{ translateY: 100 }] }}
      transform={[{ translateY: 0 }]}
      opacity={1}
      scale={1}
      viewportName={currentToast.viewportName}
    >
      <YStack>
        <Toast.Title>{currentToast.title}</Toast.Title>
        {!!currentToast.message && <Toast.Description>{currentToast.message}</Toast.Description>}
      </YStack>
    </Toast>
  )
}

export const ToastRoot = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    {children}
    <ToastViewport top={0} left={0} right={0} />
    <AppToast />
  </ToastProvider>
)
