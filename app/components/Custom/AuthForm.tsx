import { View, type ViewStyle, type TextStyle, type ImageStyle, Dimensions } from "react-native"
import { Controller, type UseFormReturn } from "react-hook-form"
import { spacing } from "@/theme"
import { TextField, Button, Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import logoImage from "../../../assets/images/logo.png"
// import { AuthForm } from "@/components/Custom/AuthForm"

const { width } = Dimensions.get("window")

interface AuthFormProps<T> {
  form: UseFormReturn<T>
  fields: Array<{
    name: keyof T
    label: string
    placeholder: string
    rules?: any
    autoCapitalize?: "none" | "sentences" | "words" | "characters"
  }>
  onSubmit: (data: T) => void | Promise<void>
  isSubmitting?: boolean
  submitText?: string
  footer?: React.ReactNode
  forgotPassword?: boolean
}

export function AuthForm<T>({
  form,
  fields,
  onSubmit,
  submitText = "Submit",
  isSubmitting = false,
}: AuthFormProps<T>) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form
  const { themed } = useAppTheme()

  return (
    <View style={$formContainer}>
      {fields.map((field) => (
        <View key={String(field.name)} style={$fieldContainer}>
          <Text preset="formLabel" style={themed($labelText)}>
            {field.label}
          </Text>
          <Controller
            control={control}
            name={field.name as any}
            rules={field.rules}
            render={({ field: { onChange, value } }) => (
              <TextField
                value={value as any}
                onChangeText={onChange}
                placeholder={field.placeholder}
                helper={errors?.[field.name]?.message}
                status={errors?.[field.name] ? "error" : undefined}
                autoCapitalize={field.autoCapitalize || "none"}
              />
            )}
          />
        </View>
      ))}

      <Button
        text={isSubmitting ? "Submitting..." : submitText}
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={themed($submitButton)}
        textStyle={themed($submitButtonText)}
      />
    </View>
  )
}

const $formContainer: ViewStyle = {
  flex: 1,
}

const $fieldContainer: ViewStyle = {
  marginBottom: spacing.lg,
}

const $labelText = (theme: any): TextStyle => ({
  color: theme.colors.text,
  marginBottom: spacing.sm,
  fontWeight: "600",
})

const $submitButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.tint,
  borderRadius: spacing.md,
  minHeight: 56,
  shadowColor: theme.colors.tint,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
})

const $submitButtonText = (theme: any): TextStyle => ({
  color: theme.colors.tintInverse,
  fontWeight: "600",
  fontSize: 16,
})
