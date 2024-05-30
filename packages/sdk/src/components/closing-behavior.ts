import type { Context } from './_context'

export type ClosingBehaviorFlavor = {
  /**
   * Enables a confirmation dialog when closing the Mini App.
   */
  enableClosingConfirmation: () => void

  /**
   * Disables a confirmation dialog when closing the Mini App.
   */
  disableClosingConfirmation: () => void
}

export function installClosingBehavior(ctx: Context<ClosingBehaviorFlavor>) {
  ctx.miniApp.enableClosingConfirmation = () => {
    ctx.eventManager.postEvent(
      'web_app_setup_closing_behavior',
      { need_confirmation: true },
    )
  }

  ctx.miniApp.disableClosingConfirmation = () => {
    ctx.eventManager.postEvent(
      'web_app_setup_closing_behavior',
      { need_confirmation: false },
    )
  }
}
