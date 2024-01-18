import type { Empty, Json } from '@telegum/mini-apps-utils'
import type { ThemeParams } from './common'

export type IncomingEvent =
  | MainButtonPressed
  | SettingsButtonPresses
  | BackButtonPresses
  | InvoiceClosed
  | ViewportChanged
  | ThemeChanged
  | PopupClosed
  | WriteAccessRequested
  | PhoneRequested
  | CustomMethodInvoked
  | ClipboardTextReceived
  | QrTextReceived
  | ScanQrPopupClosed

/**
 * https://corefork.telegram.org/api/bots/webapps#main-button-pressed
 */
export type MainButtonPressed = {
  type: 'main_button_pressed'
  data: null
}

/**
 * https://core.telegram.org/api/bots/webapps#settings-button-pressed
 */
export type SettingsButtonPresses = {
  type: 'settings_button_pressed'
  data: null
}

/**
 * https://corefork.telegram.org/api/bots/webapps#back-button-pressed
 */
export type BackButtonPresses = {
  type: 'back_button_pressed'
  data: null
}

/**
 * https://corefork.telegram.org/api/bots/webapps#invoice-closed
 */
export type InvoiceClosed = {
  type: 'invoice_closed'
  data: {
    slug: string
    status: 'cancelled' | 'failed' | 'pending' | 'paid'
  }
}

/**
 * https://corefork.telegram.org/api/bots/webapps#viewport-changed
 */
export type ViewportChanged = {
  type: 'viewport_changed'
  data: {
    height: number
    is_state_stable: boolean
    is_expanded: boolean
  }
}

/**
 * https://corefork.telegram.org/api/bots/webapps#theme-changed
 */
export type ThemeChanged = {
  type: 'theme_changed'
  data: {
    data: ThemeParams
  }
}

/**
 * https://core.telegram.org/api/bots/webapps#popup-closed
 */
export type PopupClosed = {
  type: 'popup_closed'
  data: {
    button_id?: string
  }
}

/**
 * https://corefork.telegram.org/api/bots/webapps#write-access-requested
 */
export type WriteAccessRequested = {
  type: 'write_access_requested'
  data: {
    status: 'allowed' | 'cancelled'
  }
}

/**
 * https://corefork.telegram.org/api/bots/webapps#phone-requested
 */
export type PhoneRequested = {
  type: 'phone_requested'
  data: {
    status: 'sent' | 'cancelled'
  }
}

/**
 * https://corefork.telegram.org/api/bots/webapps#custom-method-invoked
 */
export type CustomMethodInvoked = {
  type: 'custom_method_invoked'

  data:
    | { req_id: string, result: Json, error: undefined }
    | { req_id: string, result: undefined, error: string }
}

/**
 * https://corefork.telegram.org/api/bots/webapps#clipboard-text-received
 */
export type ClipboardTextReceived = {
  type: 'clipboard_text_received'
  data: {
    req_id: string
    data?: string
  }
}

/**
 * https://corefork.telegram.org/api/bots/webapps#qr-text-received
 */
export type QrTextReceived = {
  type: 'qr_text_received'
  data: {
    data: string
  }
}

/**
 * https://corefork.telegram.org/api/bots/webapps#scan-qr-popup-closed
 */
export type ScanQrPopupClosed = {
  type: 'scan_qr_popup_closed'
  data: null | Empty
}
