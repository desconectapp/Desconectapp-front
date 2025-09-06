import { types } from "mobx-state-tree"

export interface ProfileInfo {
  name: string
  age: number
  city: string
  gender: string
  current_situation: string
}

export const SignUpStoreModel = types
  .model("SignUpStoreModel", {
    preferences: types.array(types.string),
    userInfo: types.maybeNull(
      types.model({
        name: types.string,
        age: types.number,
        gender: types.string,
        city: types.string,
        current_situation: types.string,
      }),
    ),
  })
  .actions((store) => ({
    setPreferences(newPreferences: string[]) {
      store.preferences.replace(newPreferences)
    },
    setUserInfo(data: ProfileInfo) {
      const userInfo = {
        name: data.name,
        gender: data.gender,
        age: data.age,
        city: data.city,
        current_situation: data.current_situation,
      }
      store.userInfo = userInfo
    },
  }))
