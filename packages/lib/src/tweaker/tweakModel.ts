import { ParentPath } from "../parent/path"
import { setParent } from "../parent/setParent"
import { tweakedObjectProp } from "./core"

/**
 * @ignore
 */
export function tweakModel<T>(value: T, parentPath: ParentPath<any> | undefined): T {
  tweakedObjectProp.set(value as any, true)
  setParent(value, parentPath)

  // nothing to do for models, data is already proxified and its parent is set
  // for snapshots we will use its "data" object snapshot directly

  return value
}
