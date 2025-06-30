import { useToastController } from "@tamagui/toast"

export const useAppToast = () => {
  const toast = useToastController()

  const showToast = (title: string, message?: string, native = false) => {
    toast.show(title, {
      message,
      native,
      demo: false,
    })
  }

  const hide = () => {
    toast.hide()
  }

  return { showToast, hide }
}
