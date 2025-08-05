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
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
]

const workStatusOptions = [
  { label: "💼 Full-time job", value: "full-time" },
  { label: "⏰ Part-time job", value: "part-time" },
  { label: "🎓 Student", value: "student" },
  { label: "🏠 Stay at home", value: "stay-at-home" },
  { label: "🚀 Entrepreneur", value: "entrepreneur" },
  { label: "🏖️ Lots of free time", value: "free-time" },
  { label: "🔍 Looking for work", value: "job-seeking" },
  { label: "🏥 Other", value: "other" },
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
      showToast("Oops!", "Something went wrong. Please try again.")
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
          Tell us about yourself
        </Text>
        <Text preset="subheading" style={themed($subtitleText)}>
          Help us personalize your experience
        </Text>
      </View>

      <View style={$formContainer}>
        <Controller
          control={control}
          name="name"
          rules={{
            required: "We'd love to know your name!",
            minLength: {
              value: 2,
              message: "Name should be at least 2 characters long",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              label="What's your name?"
              placeholder="Enter your full name"
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
            required: "Age helps us customize your experience",
            pattern: {
              value: /^[0-9]+$/,
              message: "Please enter a valid age",
            },
            validate: (value) => {
              const age = Number.parseInt(value)
              if (age < 13) return "You must be at least 13 years old"
              if (age > 120) return "Please enter a realistic age"
              return true
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              label="How old are you?"
              placeholder="Enter your age"
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
            Gender
          </Text>
          <Controller
            control={control}
            name="gender"
            rules={{ required: "Please select your gender" }}
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
            required: "Where are you located?",
            minLength: {
              value: 2,
              message: "Please enter a valid location",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Where do you live?"
              placeholder="City, Country"
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
            What's your current situation?
          </Text>
          <Controller
            control={control}
            name="current_situation"
            rules={{ required: "Tell us about your current status" }}
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
          text={isSubmitting ? "Saving your info..." : "Continue"}
          onPress={handleSubmit(onSubmit)}
          style={themed($submitButton)}
          textStyle={themed($submitButtonText)}
          loading={isSubmitting}
          disabled={isSubmitting}
        />

        <TouchableOpacity
          style={$continueContainer}
          onPress={() => {
            showToast("Skipped", "You can always update this later in settings")
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
