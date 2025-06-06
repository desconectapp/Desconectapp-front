import { observer } from "mobx-react-lite"
import { useState } from "react"
import { Screen, Header, TextField, Button } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useForm } from "react-hook-form"

import { useLogin } from "@/hooks/Users"
import { useNavigation } from "@react-navigation/native"
import { useAppToast } from "@/components/useToast"


export const LoginScreen = observer(function LoginScreen() {
  const { themed } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  const [buttonState, setButtonState] = useState<true | false>(false)

  const LoginFunc = useLogin()
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
    LoginFunc.mutateAsync(data, {
      onSuccess: () => {
        setButtonState(false)
       // aca guardar token y user info en storage
       // revisar npm install @react-native-async-storage/async-storage

       // navigation.navigate("Home") (supongo)
      },
      onError: (error) => {
        setButtonState(false)
        showToast("Error al crear usuario", "Por favor, intenta nuevamente.")        
      },
    })
  }
  return (
    <Screen preset="scroll" contentContainerStyle={[$container, $bottomContainerInsets]}>
      <Header title="Ingresar" />      
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
        text="Ingresar"
        onPress={handleSubmit(onSubmit)}
        style={$button}
        loading={buttonState}
      />
    </Screen>
  )
})

const $container = { padding: 20 }

const $button = { marginTop: 24 }
