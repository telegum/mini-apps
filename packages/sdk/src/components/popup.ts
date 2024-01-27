import type { WebAppOpenPopup } from '@telegum/mini-apps-core/types'
import type { Context } from './_context'

export type PopupFlavor = {
  popup: Popup
}

export function installPopup(ctx: Context<PopupFlavor>) {
  ctx.miniApp.popup = new Popup(ctx)
}

export type PopupParams = {
  title?: string
  message: string
  buttons: PopupButton[]
}

export type PopupButton =
  | {
    id?: string
    type?: 'default' | 'destructive'
    text: string
  }
  | {
    id?: string
    type: 'ok' | 'close' | 'cancel'
    text?: string
  }

class Popup {
  // @todo: Shouldn't it stored in a persistent state instead?
  private shown: boolean

  constructor(private ctx: Context) {
    this.shown = false
  }

  public show(params: PopupParams): Promise<{ pressedButtonId?: string }> {
    if (this.shown) {
      throw new Error('Popup is already shown')
    }

    return new Promise((resolve) => {
      this.ctx.eventManager.postEvent(
        'web_app_open_popup',
        normalizePopupParams(params),
      )

      this.shown = true

      const unsubscribe = this.ctx.eventManager.onEvent(
        'popup_closed',
        ({ button_id }) => {
          this.shown = false
          resolve({ pressedButtonId: button_id })
          unsubscribe()
        },
      )
    })
  }
}

function normalizePopupParams({
  title,
  message,
  buttons,
}: PopupParams): WebAppOpenPopup['data'] {
  if (title != null) {
    title = title.trim()
    if (title.length > 64) {
      throw new Error(`Popup title must be at most 64 characters long, but got ${title.length}`)
    }
  }

  message = message.trim()
  if (message.length < 1 || message.length > 256) {
    throw new Error(`Popup message must be from 1 to 256 characters long, but got ${message.length}`)
  }

  if (buttons.length < 1 || buttons.length > 3) {
    throw new Error(`Popup must have from 1 to 3 buttons, but got ${buttons.length}`)
  }
  const buttonsNormalized = buttons.map(
    ({ id, type, text }) => {
      id ??= ''
      if (id.length > 64) {
        throw new Error(`Popup button ID must be at most 64 characters long, but has ${id.length}`)
      }

      text = text?.trim()
      if (text != null && text.length > 64) {
        throw new Error(`Popup button text must be at most 64 characters long, but has ${text.length}`)
      }

      type ??= 'default'
      if (!text && (type === 'default' || type === 'destructive')) {
        throw new Error(`Popup button of type "${type}" must have a text`)
      }

      return {
        id: id!,
        type: type!,
        ...(text ? { text } : {}),
      } as WebAppOpenPopup['data']['buttons'][number]
    },
  )

  return {
    message,
    buttons: buttonsNormalized,
    ...(title ? { title } : {}),
  }
}
