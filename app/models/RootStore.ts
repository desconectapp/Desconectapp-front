import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { SignUpStoreModel } from "./SignUpStore"

/**
  A RootStore model.
  **/
export const RootStoreModel = types.model("RootStore").props({
  signUpStore: types.optional(SignUpStoreModel, { preferences: [], userInfo: null }),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
