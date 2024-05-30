import { EventManager } from '@telegum/mini-apps-core'
import { isIframe } from '@telegum/mini-apps-utils'
import type { Context } from './components/_context'

import type { BackButtonFlavor } from './components/back-button'
import { installBackButton } from './components/back-button'
import type { BasicFunctionalityFlavor } from './components/basic-functionality'
import { installBasicFunctionality } from './components/basic-functionality'
import type { CloudStorageFlavor } from './components/cloud-storage'
import { installCloudStorage } from './components/cloud-storage'
import type { HapticFeedbackFlavor } from './components/haptic-feedback'
import { installHapticFeedback } from './components/haptic-feedback'
import type { MainButtonFlavor } from './components/main-button'
import { installMainButton } from './components/main-button'
import type { PermissionsFlavor } from './components/permissions'
import { installPermissions } from './components/permissions'
import type { PopupFlavor } from './components/popup'
import { installPopup } from './components/popup'
import type { SettingsButtonFlavor } from './components/settings-button'
import { installSettingsButton } from './components/settings-button'
import type { ThemingFlavor } from './components/theming'
import { installTheming } from './components/theming'
import type { ClosingBehaviorFlavor } from './components/closing-behavior'
import { installClosingBehavior } from './components/closing-behavior'

import { loadAndStoreLaunchParams } from './launch-params'
import { sessionSyncKvStorage } from './utils/storage'

export type MiniApp =
  & BasicFunctionalityFlavor
  & ThemingFlavor
  & ClosingBehaviorFlavor
  & MainButtonFlavor
  & BackButtonFlavor
  & SettingsButtonFlavor
  & PopupFlavor
  & HapticFeedbackFlavor
  & PermissionsFlavor
  & CloudStorageFlavor

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

  if (isIframe()) {
    setupInsideIframe(ctx)
  }

  installBasicFunctionality(ctx)
  installTheming(ctx)
  installClosingBehavior(ctx)
  installMainButton(ctx)
  installBackButton(ctx)
  installSettingsButton(ctx)
  installPopup(ctx)
  installHapticFeedback(ctx)
  installPermissions(ctx)
  installCloudStorage(ctx)

  return ctx.miniApp
}

function setupInsideIframe(ctx: Context) {
  let iframeCustomStyleEl: HTMLStyleElement | null = null

  ctx.eventManager.onEvent('set_custom_style', (customStyle) => {
    // @todo add `if (event.origin === 'https://web.telegram.org') {`?
    if (!iframeCustomStyleEl) {
      iframeCustomStyleEl = document.createElement('style')
      document.head.appendChild(iframeCustomStyleEl)
    }
    iframeCustomStyleEl.innerHTML = customStyle
  })
  ctx.eventManager.onEvent('reload_iframe', () => {
    ctx.eventManager.postEvent('iframe_will_reload')
    location.reload()
  })
  ctx.eventManager.postEvent('iframe_ready', { reload_supported: true })
}
