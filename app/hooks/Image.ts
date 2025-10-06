import { Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useAppToast } from "@/components/useToast"
import { useState } from "react"

export const useImagePicker = () => {
  const { showToast } = useAppToast()
  const [imageUri, setImage] = useState<string | null>(null)

  const handleImagePicker = async () => {
    Alert.alert("Update Profile Picture", "Choose an option", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" },
    ])
  }

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      showToast("Permission Denied", "Camera access is required")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    })

    handleImageResponse(result)
  }

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      showToast("Permission Denied", "Media library access is required")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    })

    handleImageResponse(result)
  }

  const handleImageResponse = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri)
    }
  }

  return {
    imageUri: imageUri,
    setImage,
    handleImagePicker,
  }
}

export default useImagePicker
