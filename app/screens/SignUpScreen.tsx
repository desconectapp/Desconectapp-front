import { observer } from "mobx-react-lite"
import { useState } from "react"
import { Screen, Header, TextField, Button } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useForm } from "react-hook-form"

import { useSignUp } from "@/hooks/Users"
import { useNavigation } from "@react-navigation/native"
import { useAppToast } from "@/components/useToast"

export const SignUpScreen = observer(function SignUpScreen() {
  const { themed } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  const [buttonState, setButtonState] = useState<true | false>(false)

  const signUpFunc = useSignUp()
  const navigation = useNavigation<AppStackScreenProps<"Welcome">["navigation"]>()
  const { showToast } = useAppToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: "NombrePorDefecto",
      surname: "ApellidoPorDefecto",
      email: "MailPorDefecto@gmail.com",
      password: "123456",
    },
  })

  const onSubmit = (data: any) => {
    setButtonState(true)
    console.log(data)
    signUpFunc.mutateAsync(data, {
      onSuccess: () => {
        setButtonState(false)
        console.log("Usuario creado exitosamente")
        showToast(`Bienvenido ${data.name}!`)
        navigation.navigate("Welcome")
      },
      onError: (error) => {
        setButtonState(false)
        showToast("Error al crear usuario", "Por favor, intenta nuevamente.")
      },
    })
  }
  return (
    <Screen preset="scroll" contentContainerStyle={[$container, $bottomContainerInsets]}>
      <Header title="Crear cuenta" />
      <TextField
        label="Nombre"
        placeholder="Tu nombre"
        {...register("name", { required: "El nombre es obligatorio" })}
        onChangeText={(text) => setValue("name", text)}
        value={watch("name")}
        helper={errors.name?.message as string}
        status={errors.name ? "error" : undefined}
      />
      <TextField
        label="Apellido"
        placeholder="Tu apellido"
        {...register("surname", { required: "El apellido es obligatorio" })}
        onChangeText={(text) => setValue("surname", text)}
        value={watch("surname")}
        helper={errors.surname?.message as string}
        status={errors.surname ? "error" : undefined}
      />
      <TextField
        label="Email"
        placeholder="Email"
        {...register("email", {
          required: "El email es obligatorio",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Email inválido",
          },
        })}
        onChangeText={(text) => setValue("email", text)}
        value={watch("email")}
        keyboardType="email-address"
        helper={errors.email?.message as string}
        status={errors.email ? "error" : undefined}
      />
      <TextField
        label="Contraseña"
        placeholder="••••••••"
        {...register("password", {
          required: "La contraseña es obligatoria",
          minLength: {
            value: 6,
            message: "La contraseña debe tener al menos 6 caracteres",
          },
        })}
        value={watch("password")}
        onChangeText={(text) => setValue("password", text)}
        secureTextEntry
        helper={errors.password?.message as string}
        status={errors.password ? "error" : undefined}
      />
      <Button
        text="Registrarse"
        onPress={handleSubmit(onSubmit)}
        style={$button}
        loading={buttonState}
      />
    </Screen>
  )
})

const $container = { padding: 20 }

const $button = { marginTop: 24 }
