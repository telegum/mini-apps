import type { Context } from './_context'

export type ClosingBehaviorFlavor = {
  /**
   * Closing confirmation dialog is shown when the user tries to close
   * the Mini App, and it is disabled by default. Enable it, if you do not want
   * the user to accidentally close the Mini App.
   */
  closingConfirmation: {
    /**
     * Enables a closing confirmation dialog.
     */
    enable: () => void

    /**
     * Disables a closing confirmation dialog.
     */
    disable: () => void

    /**
     * Returns a boolean indicating whether the closing confirmation dialog
     * is enabled.
     */
    enabled: () => boolean
  }
}

export function installClosingBehavior(ctx: Context<ClosingBehaviorFlavor>) {
  let enabled = false

  ctx.miniApp.closingConfirmation = {
    enable: () => {
      ctx.eventManager.postEvent(
        'web_app_setup_closing_behavior',
        { need_confirmation: true },
      )
      enabled = true
    },
    disable: () => {
      ctx.eventManager.postEvent(
        'web_app_setup_closing_behavior',
        { need_confirmation: false },
      )
      enabled = false
    },
    enabled: () => enabled,
  }
}
