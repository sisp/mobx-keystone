import { action, isAction } from "mobx"
import { Writable } from "ts-essentials"
import { assertTweakedObject } from "../tweaker/core"
import { inDevMode } from "../utils"
import {
  ActionContext,
  ActionContextActionType,
  getCurrentActionContext,
  setCurrentActionContext,
} from "./context"
import { getActionMiddlewares } from "./middleware"
import { FlowFinisher } from "./modelFlow"

/**
 * @ignore
 */
export const modelActionSymbol = Symbol("modelAction")

/**
 * @ignore
 */
export function wrapInAction<T extends Function>(
  name: string,
  fn: T,
  actionType: ActionContextActionType,
  overrideContext?: (ctx: Writable<ActionContext>) => void,
  isFlowFinsher = false
): T {
  if (!isAction(fn)) {
    fn = action(name, fn)
  }

  function wrappedAction(this: any) {
    if (inDevMode()) {
      assertTweakedObject(this, "wrappedAction")
    }

    const parentContext = getCurrentActionContext()

    const context: Writable<ActionContext> = {
      actionName: name,
      type: actionType,
      target: this,
      args: Array.from(arguments),
      parentContext,
      data: {},
      rootContext: undefined as any, // will be set after the override
    }
    if (overrideContext) {
      overrideContext(context)
    }
    if (!context.rootContext) {
      if (context.previousAsyncStepContext) {
        context.rootContext = context.previousAsyncStepContext.rootContext
      } else if (context.parentContext) {
        context.rootContext = context.parentContext.rootContext
      } else {
        context.rootContext = context
      }
    }

    setCurrentActionContext(context)

    let mwareFn: () => any = fn.bind(this, ...arguments)
    getActionMiddlewares(this).forEach(mware => {
      const filterPassed = mware.filter ? mware.filter(context) : true
      if (filterPassed) {
        mwareFn = mware.middleware.bind(undefined, context, mwareFn)
      }
    })

    try {
      const ret = mwareFn()
      if (isFlowFinsher) {
        const flowFinisher = ret as FlowFinisher
        flowFinisher.resolver(flowFinisher.value)
        return flowFinisher.value // not sure if this is even needed
      } else {
        return ret
      }
    } finally {
      setCurrentActionContext(context.parentContext)
    }
  }
  ;(wrappedAction as any)[modelActionSymbol] = true

  return wrappedAction as any
}