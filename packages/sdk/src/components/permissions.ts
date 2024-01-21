import type { Context } from './_context'

export type PermissionsFlavor = {
  requestWriteAccess(): Promise<boolean>
  requestPhone(): Promise<boolean>
}

export function installPermissions(ctx: Context<PermissionsFlavor>) {
  let writeAccessPromise: Promise<boolean> | null = null
  let phonePromise: Promise<boolean> | null = null

  ctx.miniApp.requestWriteAccess = () => {
    if (!writeAccessPromise) {
      writeAccessPromise = new Promise((resolve) => {
        const unsubscribe = ctx.eventManager.onEvent(
          'write_access_requested',
          ({ status }) => {
            resolve(status === 'allowed')
            unsubscribe()
          },
        )
        ctx.eventManager.postEvent('web_app_request_write_access', null)
      })
    }
    return writeAccessPromise
  }

  ctx.miniApp.requestPhone = () => {
    if (!phonePromise) {
      phonePromise = new Promise((resolve) => {
        const unsubscribe = ctx.eventManager.onEvent(
          'phone_requested',
          ({ status }) => {
            resolve(status === 'sent')
            unsubscribe()
          },
        )
        ctx.eventManager.postEvent('web_app_request_phone', null)
      })
    }
    return phonePromise
  }
}
