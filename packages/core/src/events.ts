import type { Json } from '@telegum/mini-apps-utils'
import { assertNotReached, isIframe, randomString } from '@telegum/mini-apps-utils'
import { CustomMethodFailedError } from './errors'
import type {
  CustomMethodInvoked,
  IncomingEvent,
  OutgoingEvent,
  OutgoingEventWithData,
  OutgoingEventWithoutData,
} from './types'

declare global {
  interface Window {
    Telegram?: {
      WebView?: {
        receiveEvent: ReceiveEventFn
      }
    }
    TelegramWebviewProxy?: {
      postEvent: (type: string, data?: string) => void
    }
    TelegramGameProxy_receiveEvent?: ReceiveEventFn
    TelegramGameProxy?: {
      receiveEvent: ReceiveEventFn
    }
  }
  interface External {
    notify: (data: string) => void
  }
}

type ReceiveEventFn = (eventType: string, eventData: unknown) => void

export type EventManagerOptions = {
  trustedTargetOrigin?: string
}

export class EventManager {
  private trustedTargetOrigin: string
  private communicationMethod: CommunicationMethod
  private eventListeners: Map<IncomingEvent['type'], ((data: any) => void)[]>
  private pendingCustomMethodRequests: Map<string, (data: Omit<CustomMethodInvoked['data'], 'req_id'>) => void>
  private iframeStyleEl?: HTMLStyleElement

  constructor({
    trustedTargetOrigin = '*',
  }: EventManagerOptions) {
    this.trustedTargetOrigin = trustedTargetOrigin
    this.communicationMethod = detectCommunicationMethod()
    this.eventListeners = new Map()
    this.pendingCustomMethodRequests = new Map()

    if (isIframe()) {
      this.setupInsideIframe()
    }

    if (!window.Telegram) {
      window.Telegram = {}
    }

    // Different clients invoke different methods on incoming events.
    window.Telegram.WebView = { receiveEvent: this.receiveEvent.bind(this) as ReceiveEventFn }
    window.TelegramGameProxy_receiveEvent = this.receiveEvent.bind(this) as ReceiveEventFn
    window.TelegramGameProxy = { receiveEvent: this.receiveEvent.bind(this) as ReceiveEventFn }
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
    if (eventType === 'custom_method_invoked') {
      this.onCustomMethodInvoked(eventData as Extract<IncomingEvent, { type: 'custom_method_invoked' }>['data'])
    }

    const targetEventListeners = this.eventListeners.get(eventType)
    if (targetEventListeners) {
      for (const listener of targetEventListeners) {
        try {
          listener(eventData)
        } catch (e) {}
      }
    }
  }

  onEvent<T extends IncomingEvent['type']>(
    eventType: T,
    listener: (data: Extract<IncomingEvent, { type: T }>['data']) => void,
  ): () => void {
    const listeners = this.eventListeners.get(eventType) ?? []
    listeners.push(listener)
    this.eventListeners.set(eventType, listeners)

    const unsubscribeFn = () => {
      const listeners = this.eventListeners.get(eventType)
      if (listeners) {
        const index = listeners.indexOf(listener)
        if (index !== -1) {
          listeners.splice(index, 1)
        }
      }
    }

    return unsubscribeFn
  }

  invokeCustomMethod<T = unknown>(
    method: string,
    params: Json,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = this.newCustomMethodRequestId()
      this.pendingCustomMethodRequests.set(
        requestId,
        ({ result, error }) => {
          if (error !== undefined) {
            reject(new CustomMethodFailedError(error))
          } else {
            resolve(result as T)
          }
        },
      )
      this.postEvent(
        'web_app_invoke_custom_method',
        {
          req_id: requestId,
          method,
          params,
        },
      )
    })
  }

  private onCustomMethodInvoked({
    req_id,
    result,
    error,
  }: CustomMethodInvoked['data']) {
    const pendingRequest = this.pendingCustomMethodRequests.get(req_id)
    if (pendingRequest) {
      pendingRequest({ result, error })
    }
  }

  private newCustomMethodRequestId(): string {
    for (let i = 0; i < 100; i++) {
      const id = randomString(
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        16,
      )
      if (!this.pendingCustomMethodRequests.has(id)) {
        return id
      }
    }
    throw new Error('Failed to generate a new request ID')
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
