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

export type EventManagerOptions = {
  debug?: boolean
  trustedTargetOrigin?: string
}

/**
 * Communication channel between Mini App and hosting Telegram client.
 *
 * - Handle [incoming events](https://corefork.telegram.org/api/bots/webapps#incoming-events-client-to-mini-app)
 *   from the Telegram client using `EventManager.onEvent` method.
 * - Emit [events](https://corefork.telegram.org/api/bots/webapps#outgoing-events-mini-app-to-client)
 *   to the Telegram client using `EventManager.postEvent` method.
 * - Invoke [custom methods](https://corefork.telegram.org/api/web-events#web-app-invoke-custom-method)
 *   with the `EventManager.invokeCustomMethod` method.
 *
 * @see https://corefork.telegram.org/api/bots/webapps
 * @see https://corefork.telegram.org/api/web-events
 */
export class EventManager {
  private debug: boolean
  private trustedTargetOrigin: string
  private communicationMethod: CommunicationMethod
  private eventListeners: Map<IncomingEvent['type'], ((data: any) => void)[]>
  private pendingCustomMethodRequests: Map<string, (data: Omit<CustomMethodInvoked['data'], 'req_id'>) => void>

  constructor(options: EventManagerOptions = {}) {
    const {
      debug = false,
      trustedTargetOrigin = '*',
    } = options

    this.debug = debug
    this.trustedTargetOrigin = trustedTargetOrigin
    this.communicationMethod = detectCommunicationMethod()
    this.eventListeners = new Map()
    this.pendingCustomMethodRequests = new Map()
    this.registerEventReceivers()
  }

  /**
   * Emits an event to the hosting Telegram client using the automatically
   * detected communication method, which may differ between clients.
   *
   * @see https://corefork.telegram.org/api/web-events
   * @param eventType Type of the event.
   * @param eventData Event payload specific for each event type.
   */
  postEvent<T extends OutgoingEventWithData['type']>(eventType: T, eventData: Extract<OutgoingEventWithData, { type: T }>['data']): void
  postEvent<T extends OutgoingEventWithoutData['type']>(eventType: T, eventData?: never): void
  postEvent(eventType: OutgoingEvent['type'], eventData?: unknown) {
    if (eventData === undefined) {
      eventData = ''
    }

    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[MiniApp] ->', eventType, eventData)
    }

    switch (this.communicationMethod) {
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
        assertNotReached(this.communicationMethod)
    }
  }

  /**
   * Registers a listener function that will be invoked each time the hosting
   * Telegram client will send an event to the Mini App.
   *
   * @param eventType Event type to subscribe to.
   * @param listener Function to be called when a new event of a specified type
   *  is received from the hosting Telegram client. Event data will be passed
   *  as a first argument.
   * @returns Function that can be called to remove the registered event
   *  listener.
   */
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

  /**
   * Invokes a custom method call to Telegram servers via the hosting Telegram
   * client, automatically registering a one-time listener to handle custom
   * method result and resolve the returned promise.
   *
   * @see https://corefork.telegram.org/api/web-events#web-app-invoke-custom-method
   * @param method Custom method type to invoke.
   * @param params Paramaters that should be passed to the custom method.
   * @returns Promise that will be resolved with the result of the custom
   *  method invocation, or rejected with a `CustomMethodFailedError` containing
   *  message describing the error in case custom method fails.
   */
  invokeCustomMethod<T = unknown>(method: string, params: Json): Promise<T> {
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
        { req_id: requestId, method, params },
      )
    })
  }

  private registerEventReceivers() {
    // Different hosting clients of different versions send events
    // in different ways — need to setup different receivers.

    // (1)
    if (isIframe()) {
      try {
        window.addEventListener('message', (event) => {
          if (event.source !== window.parent) {
            return
          }
          try {
            const { eventType, eventData } = JSON.parse(event.data)
            if (eventType) {
              this.receiveEvent(eventType, eventData)
            }
          } catch (_) {}
        })
      } catch (_) {}
    }

    // (2)
    if (!window.Telegram) {
      window.Telegram = {}
    }
    window.Telegram.WebView = { receiveEvent: this.receiveEvent.bind(this) as ReceiveEventFn }

    // (3)
    window.TelegramGameProxy_receiveEvent = this.receiveEvent.bind(this) as ReceiveEventFn

    // (4)
    window.TelegramGameProxy = { receiveEvent: this.receiveEvent.bind(this) as ReceiveEventFn }
  }

  private receiveEvent<T extends IncomingEvent['type']>(
    eventType: T,
    eventData: Extract<IncomingEvent, { type: T }>['data'],
  ): void {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[MiniApp] <-', eventType, eventData)
    }

    if (eventType === 'custom_method_invoked') {
      this.onCustomMethodInvoked(eventData as Extract<IncomingEvent, { type: 'custom_method_invoked' }>['data'])
    }

    const targetEventListeners = this.eventListeners.get(eventType)
    if (targetEventListeners) {
      for (const listener of targetEventListeners) {
        try {
          listener(eventData)
        } catch (e) {
          console.error(`Event listener for "${eventType}" thrown an error:`, e)
        }
      }
    }
  }

  private onCustomMethodInvoked({
    req_id,
    result,
    error,
  }: CustomMethodInvoked['data']) {
    const pendingRequest = this.pendingCustomMethodRequests.get(req_id)
    if (pendingRequest) {
      pendingRequest({ result, error })
      this.pendingCustomMethodRequests.delete(req_id)
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

type ReceiveEventFn = (eventType: string, eventData: unknown) => void

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
