import type { IncomingEvent } from './types/events-incoming'
import type { OutgoingEvent, OutgoingEventWithData, OutgoingEventWithoutData } from './types/events-outgoing'
import { assertNotReached } from './utils/assertNotReached'
import { isIframe } from './utils/isIframe'

export type EventsManagerOptions = {
  trustedTargetOrigin?: string
}

export class EventsManager {
  private trustedTargetOrigin: string
  private communicationMethod: CommunicationMethod
  private eventListeners: Map<IncomingEvent['type'], ((data: any) => void)[]>
  private iframeStyleEl?: HTMLStyleElement

  constructor({
    trustedTargetOrigin = '*',
  }: EventsManagerOptions) {
    this.trustedTargetOrigin = trustedTargetOrigin
    this.communicationMethod = detectCommunicationMethod()
    this.eventListeners = new Map()

    if (isIframe()) {
      this.setupInsideIframe()
    }

    // For backward compatibility.
    window.TelegramGameProxy_receiveEvent = this.receiveEvent.bind(this)
    window.TelegramGameProxy = { receiveEvent: this.receiveEvent.bind(this) }
  }

  private setupInsideIframe() {
    try {
      window.addEventListener('message', (event) => {
        if (event.source !== window.parent) {
          return
        }

        let dataParsed
        try {
          dataParsed = JSON.parse(event.data)
        } catch (e) {
          return
        }

        if (!dataParsed || !dataParsed.eventType) {
          return
        }

        if (dataParsed.eventType === 'set_custom_style') {
          if (event.origin === 'https://web.telegram.org') {
            if (!this.iframeStyleEl) {
              this.iframeStyleEl = document.createElement('style')
              document.head.appendChild(this.iframeStyleEl)
            }
            this.iframeStyleEl.innerHTML = dataParsed.eventData
          }
        } else if (dataParsed.eventType === 'reload_iframe') {
          try {
            this.postEventUsingMethod(
              'iframe_will_reload',
              null,
              'window.parent.postMessage',
            )
          } catch (e) {}
          location.reload()
        } else {
          this.receiveEvent(dataParsed.eventType, dataParsed.eventData)
        }
      })
      this.postEventUsingMethod(
        'iframe_ready',
        { reload_supported: true },
        'window.parent.postMessage',
      )
    } catch (e) {}
  }

  private postEventUsingMethod(
    eventType: string,
    eventData: unknown,
    method: CommunicationMethod,
  ): void {
    if (eventData === undefined) {
      eventData = null
    }
    switch (method) {
      case 'window.TelegramWebviewProxy.postEvent':
        window
          .TelegramWebviewProxy!
          .postEvent(eventType, JSON.stringify(eventData))
        break
      case 'window.external.notify':
        window
          .external
          .notify(JSON.stringify({ eventType, eventData }))
        break
      case 'window.parent.postMessage':
        window
          .parent
          .postMessage(JSON.stringify({ eventType, eventData }), this.trustedTargetOrigin)
        break
      default:
        assertNotReached(method)
    }
  }

  postEvent<T extends OutgoingEventWithData['type']>(eventType: T, eventData: Extract<OutgoingEventWithData, { type: T }>['data']): void
  postEvent<T extends OutgoingEventWithoutData['type']>(eventType: T, eventData?: never): void
  postEvent(eventType: OutgoingEvent['type'], eventData?: unknown) {
    this.postEventUsingMethod(eventType, eventData, this.communicationMethod)
  }

  receiveEvent<T extends IncomingEvent['type']>(
    eventType: T,
    eventData: Extract<IncomingEvent, { type: T }>['data'],
  ): void {
    const targetEventListeners = this.eventListeners.get(eventType)
    if (targetEventListeners) {
      for (const listener of targetEventListeners) {
        try {
          listener(eventData)
        } catch (e) {}
      }
    }
  }

  addEventListener<T extends IncomingEvent['type']>(
    eventType: T,
    listener: (data: Extract<IncomingEvent, { type: T }>['data']) => void,
  ): void {
    let targetEventListeners = this.eventListeners.get(eventType)
    if (!targetEventListeners) {
      targetEventListeners = []
    }
    if (!targetEventListeners.includes(listener)) {
      targetEventListeners.push(listener)
    }
    this.eventListeners.set(eventType, targetEventListeners)
  }

  removeEventListener<T extends IncomingEvent['type']>(
    eventType: T,
    listener: (data: Extract<IncomingEvent, { type: T }>['data']) => void,
  ): void {
    const targetEventListeners = this.eventListeners.get(eventType)
    if (targetEventListeners) {
      const index = targetEventListeners.indexOf(listener)
      if (index !== -1) {
        targetEventListeners.splice(index, 1)
      }
    }
  }
}

type CommunicationMethod =
  | 'window.TelegramWebviewProxy.postEvent'
  | 'window.external.notify'
  | 'window.parent.postMessage'

function detectCommunicationMethod(): CommunicationMethod {
  if (window.TelegramWebviewProxy !== undefined) {
    return 'window.TelegramWebviewProxy.postEvent'
  } else if (window.external && 'notify' in window.external) {
    return 'window.external.notify'
  } else if (isIframe()) {
    return 'window.parent.postMessage'
  }
  throw new Error('Failed to detect Mini App communication method')
}

declare global {
  interface Window {
    TelegramWebviewProxy?: {
      postEvent: (type: string, data?: string) => void
    }
    TelegramGameProxy_receiveEvent?: (...args: any[]) => void
    TelegramGameProxy?: {
      receiveEvent: (...args: any[]) => void
    }
  }
  interface External {
    notify: (data: string) => void
  }
}
