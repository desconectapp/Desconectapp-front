import { useState } from "react"
import { Button, Label, Switch, XStack } from "tamagui"
import { useAppToast } from "./useToast"

export const ToastControls = () => {
  const [native, setNative] = useState(false)
  const { showToast, hide } = useAppToast()

  return (
    <XStack gap="$4" alignItems="center" justifyContent="center">
      <Button
        onPress={() =>
          showToast("Successfully saved!", "Don't worry, we've got your data.", native)
        }
      >
        Show
      </Button>
      <Button onPress={hide}>Hide</Button>

      <Label size="$1" onPress={() => setNative(false)}>
        Custom
      </Label>
      <Switch
        id="native-toggle"
        theme="accent"
        size="$1"
        checked={native}
        onCheckedChange={setNative}
      >
        <Switch.Thumb />
      </Switch>
      <Label size="$1" onPress={() => setNative(true)}>
        Native
      </Label>
    </XStack>
  )
}
