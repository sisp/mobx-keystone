import { ActionContextActionType } from "../action/context"
import { HookAction } from "../action/hookActions"
import { wrapInAction, wrapModelMethodInActionIfNeeded } from "../action/wrapInAction"
import { Model } from "../model/Model"
import { walkTree, WalkTreeMode } from "../parent/walkTree"
import { objectHiddenProperty } from "../utils"

const onAttachedDisposersProp = objectHiddenProperty<() => void>("onAttachedDisposers")

/**
 * @ignore
 */
export function attachToRootStore(rootStore: object, child: object): void {
  walkTree(
    child,
    ch => {
      if (ch instanceof Model && ch.onAttachedToRootStore) {
        wrapModelMethodInActionIfNeeded(
          ch,
          "onAttachedToRootStore",
          HookAction.OnAttachedToRootStore
        )

        const disposer = ch.onAttachedToRootStore(rootStore)
        if (disposer) {
          // wrap disposer in action
          const disposerAction = wrapInAction(
            HookAction.OnAttachedToRootStoreDisposer,
            disposer,
            ActionContextActionType.Sync
          )
          onAttachedDisposersProp.set(ch, disposerAction)
        }
      }
    },
    WalkTreeMode.ParentFirst
  )
}

/**
 * @ignore
 */
export function detachFromRootStore(child: object): void {
  walkTree(
    child,
    ch => {
      const disposerAction = onAttachedDisposersProp.get(ch)
      if (disposerAction) {
        onAttachedDisposersProp.delete(ch)
        disposerAction.call(ch)
      }
    },
    WalkTreeMode.ChildrenFirst
  )
}
