import type { Json } from '@telegum/mini-apps-utils'

export type OutgoingEvent =
  | WebAppClose
  | WebAppOpenPopup
  | WebAppRequestWriteAccess
  | WebAppRequestPhone
  | WebAppInvokeCustomMethod
  | WebAppReadTextFromClipboard
  | WebAppOpenScanQrPopup
  | WebAppCloseScanQrPopup
  | WebAppSetupClosingBehavior
  | WebAppSetBackgroundColor
  | WebAppSetHeaderColor
  | WebAppDataSend
  | WebAppSwitchInlineQuery
  | WebAppTriggerHapticFeedback
  | WebAppOpenLink
  | WebAppOpenTgLink
  | WebAppOpenInvoice
  | WebAppExpand
  | WebAppRequestViewport
  | WebAppRequestTheme
  | WebAppReady
  | WebAppSetupMainButton
  | WebAppSetupBackButton
  | WebAppSetupSettingsButton
  | IframeWillReload
  | IframeReady

export type OutgoingEventWithData = {
  [K in OutgoingEvent['type']]: Extract<OutgoingEvent, { type: K, data: any }>
}[
  OutgoingEvent['type']
]
export type OutgoingEventWithoutData = Exclude<OutgoingEvent, OutgoingEventWithData>

/**
 * https://corefork.telegram.org/api/web-events#web-app-close
 */
export type WebAppClose = {
  type: 'web_app_close'
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-open-popup
 */
export type WebAppOpenPopup = {
  type: 'web_app_open_popup'
  data: {
    title?: string
    message: string
    buttons: (
      & { id: string }
      & (
        | {
          type: 'ok' | 'close' | 'cancel'
          text?: string
        }
        | {
          type?: 'default' | 'destructive'
          text: string
        }
      )
    )[]
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-request-write-access
 */
export type WebAppRequestWriteAccess = {
  type: 'web_app_request_write_access'
  data: null
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-request-phone
 */
export type WebAppRequestPhone = {
  type: 'web_app_request_phone'
  data: null
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-invoke-custom-method
 */
export type WebAppInvokeCustomMethod = {
  type: 'web_app_invoke_custom_method'
  data: {
    req_id: string
    method: string
    params: Json
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-read-text-from-clipboard
 */
export type WebAppReadTextFromClipboard = {
  type: 'web_app_read_text_from_clipboard'
  data: {
    req_id: string
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-open-scan-qr-popup
 */
export type WebAppOpenScanQrPopup = {
  type: 'web_app_open_scan_qr_popup'
  data: {
    text?: string
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-close-scan-qr-popup
 */
export type WebAppCloseScanQrPopup = {
  type: 'web_app_close_scan_qr_popup'
  data: null
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-setup-closing-behavior
 */
export type WebAppSetupClosingBehavior = {
  type: 'web_app_setup_closing_behavior'
  data: {
    need_confirmation: boolean
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-set-background-color
 */
export type WebAppSetBackgroundColor = {
  type: 'web_app_set_background_color'
  data: {
    color: string
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-set-header-color
 */
export type WebAppSetHeaderColor = {
  type: 'web_app_set_header_color'
  data:
    | { color_key: 'bg_color' | 'secondary_bg_color' }
    | { color: string }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-data-send
 */
export type WebAppDataSend = {
  type: 'web_app_data_send'
  data: {
    data: string
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-switch-inline-query
 */
export type WebAppSwitchInlineQuery = {
  type: 'web_app_switch_inline_query'
  data: {
    query: string
    chat_types: (
      | 'users'
      | 'bots'
      | 'groups'
      | 'channels'
    )[]
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-trigger-haptic-feedback
 */
export type WebAppTriggerHapticFeedback = {
  type: 'web_app_trigger_haptic_feedback'
  data:
    | { type: 'selection_change' }
    | {
      type: 'impact'
      impact_style:
        | 'light' | 'medium' | 'heavy'
        | 'rigid' | 'soft'
    }
    | {
      type: 'notification'
      notification_type: 'error' | 'success' | 'warning'
    }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-open-link
 */
export type WebAppOpenLink = {
  type: 'web_app_open_link'
  data: {
    url: string
    try_instant_view?: boolean
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-open-tg-link
 */
export type WebAppOpenTgLink = {
  type: 'web_app_open_tg_link'
  data: {
    path_full: string
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-open-invoice
 */
export type WebAppOpenInvoice = {
  type: 'web_app_open_invoice'
  data: {
    slug: string
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-expand
 */
export type WebAppExpand = {
  type: 'web_app_expand'
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-request-viewport
 */
export type WebAppRequestViewport = {
  type: 'web_app_request_viewport'
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-request-theme
 */
export type WebAppRequestTheme = {
  type: 'web_app_request_theme'
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-ready
 */
export type WebAppReady = {
  type: 'web_app_ready'
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-setup-main-button
 */
export type WebAppSetupMainButton = {
  type: 'web_app_setup_main_button'
  data: {
    is_visible?: boolean
    is_active?: boolean
    text?: string
    color?: string
    text_color?: string
    is_progress_visible?: boolean
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-setup-back-button
 */
export type WebAppSetupBackButton = {
  type: 'web_app_setup_back_button'
  data: {
    is_visible: boolean
  }
}

/**
 * https://corefork.telegram.org/api/web-events#web-app-setup-settings-button
 */
export type WebAppSetupSettingsButton = {
  type: 'web_app_setup_settings_button'
  data: {
    is_visible: boolean
  }
}

/**
 * https://tg.dev/js/telegram-web-app.js
 */
export type IframeWillReload = {
  type: 'iframe_will_reload'
}

export type IframeReady = {
  type: 'iframe_ready'
  data: { reload_supported: boolean }
}

/**
 * @todo Check whether payment_form_submit, share_score, share_game, game_over,
 *       game_loaded and resize_frame are supported and useful in web apps.
 */
