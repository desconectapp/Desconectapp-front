import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { SignUpStoreModel } from "./SignUpStore"
import { SessionModel } from "./SessionStore"
import { RequestStoreModel } from "./RequestStore"

/**
  A RootStore model.
  **/
export const RootStoreModel = types.model("RootStore").props({
  signUpStore: types.optional(SignUpStoreModel, { preferences: [], userInfo: null }),
  sessionStore: types.optional(SessionModel, {
    email: "",
    expiresAt: "",
    refreshExpiresAt: "",
    refreshToken: "",
    token: "",
  }),
  requestStore: types.optional(RequestStoreModel, {
    activities: [],
    location: null,
    schedules: [],
  }),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
