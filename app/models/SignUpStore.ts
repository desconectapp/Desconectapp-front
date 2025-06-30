import { types } from "mobx-state-tree"

export const SignUpStoreModel = types
  .model("SignUpStoreModel", {
    preferences: types.array(types.string),
    username: types.maybeNull(types.string),
    token: types.maybeNull(types.string),
  })
  .actions((store) => ({
    setPreferences(newPreferences: string[]) {
      store.preferences.replace(newPreferences)
    },
  }))
