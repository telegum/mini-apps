import type { WebAppTriggerHapticFeedback } from '@telegum/mini-apps-core/types'
import type { Context } from './_context'

export type HapticFeedbackFlavor = {
  /**
   * Trigger haptic feedback.
   *
   * Note that haptic feedback is supported on limited number of devices.
   *
   * @param style Style of the haptic feedback.
   */
  haptic: (style: HapticFeedbackStyle) => void
}

export function installHapticFeedback(ctx: Context<HapticFeedbackFlavor>) {
  ctx.miniApp.haptic = (style) => {
    ctx.eventManager.postEvent(
      'web_app_trigger_haptic_feedback',
      getTriggerHapticFeedbackEventDataForStyle(style),
    )
  }
}

export type HapticFeedbackStyle =
  | 'selection-change'
  | 'error'
  | 'success'
  | 'warning'
  | 'impact-light'
  | 'impact-medium'
  | 'impact-heavy'
  | 'impact-rigid'
  | 'impact-soft'

function getTriggerHapticFeedbackEventDataForStyle(
  style: HapticFeedbackStyle,
): WebAppTriggerHapticFeedback['data'] {
  switch (style) {
    case 'selection-change':
      return { type: 'selection_change' }
    case 'success':
      return { type: 'notification', notification_type: 'success' }
    case 'warning':
      return { type: 'notification', notification_type: 'warning' }
    case 'error':
      return { type: 'notification', notification_type: 'error' }
    case 'impact-light':
      return { type: 'impact', impact_style: 'light' }
    case 'impact-medium':
      return { type: 'impact', impact_style: 'medium' }
    case 'impact-heavy':
      return { type: 'impact', impact_style: 'heavy' }
    case 'impact-rigid':
      return { type: 'impact', impact_style: 'rigid' }
    case 'impact-soft':
      return { type: 'impact', impact_style: 'soft' }
  }
}
