import { types } from "mobx-state-tree"

export interface UserInfo {
  name: string
  age: number
  location: string
  gender: string
  workStatus: string
}

export const SignUpStoreModel = types
  .model("SignUpStoreModel", {
    preferences: types.array(types.string),
    userInfo: types.maybeNull(
      types.model({
        name: types.string,
        age: types.number,
        gender: types.string,
        location: types.string,
        workStatus: types.string,
      }),
    ),
  })
  .actions((store) => ({
    setPreferences(newPreferences: string[]) {
      store.preferences.replace(newPreferences)
    },
    setUserInfo(data: UserInfo) {
      const userInfo = {
        name: data.name,
        gender: data.gender,
        age: data.age,
        location: data.location,
        workStatus: data.workStatus,
      }
      store.userInfo = userInfo
    },
  }))
