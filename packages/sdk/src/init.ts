import { EventManager } from '@telegum/mini-apps-core'
import type { Context } from './components/_context'

import type { BasicFunctionalityFlavor } from './components/basic-functionality'
import { installBasicFunctionality } from './components/basic-functionality'
import type { CloudStorageFlavor } from './components/cloud-storage'
import { installCloudStorage } from './components/cloud-storage'
import type { HapticFeedbackFlavor } from './components/haptic-feedback'
import { installHapticFeedback } from './components/haptic-feedback'
import type { MainButtonFlavor } from './components/main-button'
import { installMainButton } from './components/main-button'
import type { ThemingFlavor } from './components/theming'
import { installTheming } from './components/theming'

import { loadAndStoreLaunchParams } from './launch-params'
import { sessionSyncKvStorage } from './utils/storage'

export type MiniApp =
  & BasicFunctionalityFlavor
  & ThemingFlavor
  & MainButtonFlavor
  & HapticFeedbackFlavor
  & CloudStorageFlavor

/* @todo

function setupInsideIframe() {
  this.eventManager.onEvent('set_custom_style', (customStyle) => {
    // @todo add `if (event.origin === 'https://web.telegram.org') {`?
    if (!this.iframeCustomStyleEl) {
      this.iframeCustomStyleEl = document.createElement('style')
      document.head.appendChild(this.iframeCustomStyleEl)
    }
    this.iframeCustomStyleEl.innerHTML = customStyle
  })
  this.eventManager.onEvent('reload_iframe', () => {
    this.eventManager.postEvent('iframe_will_reload')
    location.reload()
  })
  this.eventManager.postEvent('iframe_ready', { reload_supported: true })
}
*/

export function init(): MiniApp {
  const ctx: Context<MiniApp> = {
    storage: sessionSyncKvStorage,
    launchParams: loadAndStoreLaunchParams({
      storage: sessionSyncKvStorage,
      key: '__MiniApp__LaunchParams',
    }),
    eventManager: new EventManager(),
    miniApp: {} as MiniApp,
  }

  installBasicFunctionality(ctx)
  installTheming(ctx)
  installMainButton(ctx)
  installHapticFeedback(ctx)
  installCloudStorage(ctx)

  return ctx.miniApp
}
