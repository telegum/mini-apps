import type { Context } from './_context'

export type QrScannerFlavor = {
  /**
   * Object that can be used to interact with the QR-Scanner popup.
   */
  qrScanner: {
    /**
     * Opens the QR-Scanner popup.
     *
     * @param text Text to display in the QR-Scanner popup.
     */
    open: (text?: string) => void

    /**
     * Closes the QR-Scanner popup.
     */
    close: () => void

    /**
     * Registers a listener to receive the scanned QR-Code data.
     *
     * @param listener Listener function that will be called, when a QR-Code is
     *  scanned. It can return `true` to close the QR-Scanner popup.
     * @returns Function that can be called to remove the listener.
     */
    onData: (listener: (data: string) => void | true) => () => void

    /**
     * Registers a listener to be called when the QR-Scanner popup is closed.
     *
     * @param listener Listener function that will be called when the QR-Scanner
     *  popup is closed by the user, or due to permission errors.
     * @returns Function that can be called to remove the listener.
     */
    onClose: (listener: () => void) => () => void

    /**
     * @returns `true` if the QR-Scanner popup is currently open, `false`
     *  otherwise.
     */
    opened: () => boolean
  }
}

export function installQrScanner(ctx: Context<QrScannerFlavor>) {
  let isOpen = false
  const dataListeners: ((data: string) => void | true)[] = []
  const closeListeners: (() => void)[] = []

  const open: QrScannerFlavor['qrScanner']['open'] = (text) => {
    const params: { text?: string } = {}

    text = text?.trim()
    if (text) {
      if (text.length > 64) {
        throw new Error(`QR-Scanner text must be at most 64 characters long, but got: ${text.length}`)
      }
      params.text = text
    }

    if (!isOpen) {
      ctx.eventManager.postEvent('web_app_open_scan_qr_popup', params)
      isOpen = true
    }
  }

  const close: QrScannerFlavor['qrScanner']['close'] = () => {
    if (isOpen) {
      ctx.eventManager.postEvent('web_app_close_scan_qr_popup', null)
      isOpen = false
    }
  }

  ctx.eventManager.onEvent(
    'scan_qr_popup_closed',
    () => {
      isOpen = false
      for (const listener of closeListeners) {
        try {
          listener()
        } catch (e) {
          console.error('QR-Scanner close listener threw an error:', e)
        }
      }
    },
  )

  ctx.eventManager.onEvent(
    'qr_text_received',
    ({ data }) => {
      if (data) {
        let shouldClose = false
        for (const listener of dataListeners) {
          try {
            shouldClose = !!(listener(data))
          } catch (e) {
            console.error('QR-Scanner data listener threw an error:', e)
          }
        }
        if (shouldClose) {
          close()
        }
      }
    },
  )

  ctx.miniApp.qrScanner = {
    open,
    close,
    onData: (listener) => {
      if (!dataListeners.includes(listener)) {
        dataListeners.push(listener)
      }
      return () => {
        const index = dataListeners.indexOf(listener)
        if (index >= 0) {
          dataListeners.splice(index, 1)
        }
      }
    },
    onClose: (listener) => {
      if (!closeListeners.includes(listener)) {
        closeListeners.push(listener)
      }
      return () => {
        const index = closeListeners.indexOf(listener)
        if (index >= 0) {
          closeListeners.splice(index, 1)
        }
      }
    },
    opened: () => isOpen,
  }
}
