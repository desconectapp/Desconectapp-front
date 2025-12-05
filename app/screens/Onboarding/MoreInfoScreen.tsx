import { observer } from "mobx-react-lite"
import { useState } from "react"
import { View, type ViewStyle, type TextStyle, TouchableOpacity } from "react-native"
import { Screen, TextField, Button, Text } from "@/components"
import type { AppStackScreenProps } from "../../navigators"
import { useSafeAreaInsetsStyle } from "../../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useForm, Controller } from "react-hook-form"
import { useNavigation } from "@react-navigation/native"
import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import { useStores } from "@/models"
import { useCreateProfile } from "@/hooks/Users"

interface UserInfoFormData {
  name: string
  age: string
  gender: string
  city: string
  current_situation: string
}

const genderOptions = [
  { label: "Masculino", value: "male" },
  { label: "Femenino", value: "female" },
]

const workStatusOptions = [
  { label: "💼 Trabajo tiempo completo", value: "full-time" },
  { label: "⏰ Trabajo tiempo parcial", value: "part-time" },
  { label: "🎓 Estudiante", value: "student" },
  { label: "🏠 En casa", value: "stay-at-home" },
  { label: "🚀 Emprendedor", value: "entrepreneur" },
  { label: "🏖️ Mucho tiempo libre", value: "free-time" },
  { label: "🔍 Buscando trabajo", value: "job-seeking" },
  { label: "🏥 Otro", value: "other" },
]

export const MoreInfoScreen = observer(function MoreInfoScreen() {
  const { themed } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()
  const { showToast } = useAppToast()
  const { signUpStore } = useStores()

  const { mutateAsync: createProfileMutateAsync } = useCreateProfile()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInfoFormData>({
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      city: "",
      current_situation: "",
    },
  })

  const onSubmit = async (data: UserInfoFormData) => {
    setIsSubmitting(true)

    const d = {
      name: data.name,
      age: Number.parseInt(data.age),
      gender: data.gender,
      city: data.city,
      current_situation: data.current_situation,
      preferences: [],
    }

    try {
      await createProfileMutateAsync(d)
      signUpStore.setUserInfo(d)
      navigation.navigate("Main", { screen: "PreferencesScreen" })
    } catch (error) {
      console.error("Error saving user info:", error)
      showToast("¡Ups!", "Algo salió mal. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderOptionButton = (
    options: Array<{ label: string; value: string }>,
    selectedValue: string,
    onSelect: (value: string) => void,
  ) => {
    return (
      <View style={$optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              $optionButton,
              themed($optionButtonStyle),
              selectedValue === option.value && themed($optionButtonSelected),
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                themed($optionText),
                selectedValue === option.value && themed($optionTextSelected),
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[$container, $bottomContainerInsets]}
      backgroundColor={themed($screenBackground).backgroundColor}
    >
      <View style={$headerContainer}>
        <Text preset="heading" style={themed($titleText)}>
          Contanos sobre vos
        </Text>
        <Text preset="subheading" style={themed($subtitleText)}>
          Ayudanos a personalizar tu experiencia
        </Text>
      </View>

      <View style={$formContainer}>
        <Controller
          control={control}
          name="name"
          rules={{
            required: "¡Nos encantaría saber tu nombre!",
            minLength: {
              value: 2,
              message: "El nombre debe tener al menos 2 letras",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              label="¿Cuál es tu nombre?"
              placeholder="Ingresa tu nombre completo"
              value={value}
              onChangeText={onChange}
              helper={errors.name?.message}
              status={errors.name ? "error" : undefined}
              containerStyle={$fieldContainer}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={control}
          name="age"
          rules={{
            required: "La edad nos ayuda a personalizar tu experiencia",
            pattern: {
              value: /^[0-9]+$/,
              message: "Por favor ingresa una edad válida",
            },
            validate: (value) => {
              const age = Number.parseInt(value)
              if (age < 13) return "Debes tener al menos 13 años"
              if (age > 120) return "Por favor ingresa una edad realista"
              return true
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              label="¿Cuántos años tenés?"
              placeholder="Ingresa tu edad"
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              helper={errors.age?.message}
              status={errors.age ? "error" : undefined}
              containerStyle={$fieldContainer}
            />
          )}
        />

        <View style={$fieldContainer}>
          <Text preset="formLabel" style={themed($labelText)}>
            Género
          </Text>
          <Controller
            control={control}
            name="gender"
            rules={{ required: "Por favor selecciona tu género" }}
            render={({ field: { onChange, value } }) =>
              renderOptionButton(genderOptions, value, onChange)
            }
          />
          {errors.gender && (
            <Text preset="formHelper" style={themed($errorText)}>
              {errors.gender.message}
            </Text>
          )}
        </View>

        <Controller
          control={control}
          name="city"
          rules={{
            required: "¿Dónde estás?",
            minLength: {
              value: 2,
              message: "Por favor ingresa una ubicación válida",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              label="¿Dónde vivís?"
              placeholder="Ciudad, País"
              value={value}
              onChangeText={onChange}
              helper={errors.city?.message}
              status={errors.city ? "error" : undefined}
              containerStyle={$fieldContainer}
              autoCapitalize="words"
            />
          )}
        />

        <View style={$fieldContainer}>
          <Text preset="formLabel" style={themed($labelText)}>
            ¿Cuál es tu situación actual?
          </Text>
          <Controller
            control={control}
            name="current_situation"
            rules={{ required: "Cuéntanos sobre tu estado actual" }}
            render={({ field: { onChange, value } }) =>
              renderOptionButton(workStatusOptions, value, onChange)
            }
          />
          {errors.current_situation && (
            <Text preset="formHelper" style={themed($errorText)}>
              {errors.current_situation.message}
            </Text>
          )}
        </View>

        <Button
          text={isSubmitting ? "Guardando tu información..." : "Continuar"}
          onPress={handleSubmit(onSubmit)}
          style={themed($submitButton)}
          textStyle={themed($submitButtonText)}
          loading={isSubmitting}
          disabled={isSubmitting}
        />

        <TouchableOpacity
          style={$continueContainer}
          onPress={() => {
            showToast("Omitido", "Siempre podés actualizar esto más tarde en configuración")
            navigation.navigate("Welcome")
          }}
          activeOpacity={0.7}
        ></TouchableOpacity>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
}

const $screenBackground = (theme: any) => ({
  backgroundColor: theme.colors.background,
})

const $headerContainer: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.xl,
  paddingTop: spacing.lg,
}

const $titleText = (theme: any): TextStyle => ({
  color: theme.colors.text,
  marginBottom: spacing.xs,
  textAlign: "center",
})

const $subtitleText = (theme: any): TextStyle => ({
  color: theme.colors.textDim,
  textAlign: "center",
  opacity: 0.8,
})

const $formContainer: ViewStyle = {
  flex: 1,
}

const $fieldContainer: ViewStyle = {
  marginBottom: spacing.lg,
}

const $labelText = (theme: any): TextStyle => ({
  color: theme.colors.text,
  marginBottom: spacing.sm,
})

const $optionsContainer: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: spacing.sm,
  marginTop: spacing.xs,
}

const $optionButton: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: spacing.lg,
  borderWidth: 1.5,
  minWidth: "45%",
  alignItems: "center",
}

const $optionButtonStyle = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.background,
  borderColor: theme.colors.border,
})

const $optionButtonSelected = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  borderColor: theme.colors.tint,
})

const $optionText = (theme: any): TextStyle => ({
  color: theme.colors.text,
  fontSize: 14,
  fontWeight: "500",
})

const $optionTextSelected = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontWeight: "600",
})

const $errorText = (theme: any): TextStyle => ({
  color: theme.colors.error,
  marginTop: spacing.xs,
})

const $submitButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  borderRadius: spacing.md,
  marginTop: spacing.lg,
  marginBottom: spacing.md,
  minHeight: 56,
  shadowColor: theme.colors.tint,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
})

const $submitButtonText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontWeight: "600",
  fontSize: 16,
})

const $continueContainer: ViewStyle = {
  alignItems: "center",
  paddingVertical: spacing.md,
}
