import { Frozen, frozenKey } from "../frozen/Frozen"
import { ParentPath } from "../parent/path"
import { setParent } from "../parent/setParent"
import { setInternalSnapshot } from "../snapshot/internal"
import { tweakedObjectProp } from "./core"

/**
 * @ingore
 */
export function tweakFrozen<T extends Frozen<any>>(
  frozenObj: T,
  parentPath: ParentPath<any> | undefined
): T {
  tweakedObjectProp.set(frozenObj, true)
  setParent(frozenObj, parentPath)

  // we DON'T want data proxified, but the snapshot is the data itself
  setInternalSnapshot(frozenObj, { [frozenKey]: true, data: frozenObj.data })

  return frozenObj as any
}
