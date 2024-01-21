import type { InitData } from '@telegum/mini-apps-core/types'
import type { Empty, StringWithHints } from '@telegum/mini-apps-utils'
import type { Context } from './_context'

export type BasicFunctionalityFlavor = {
  version: Version
  platform: Platform
  initData: InitData | Empty
  initDataRaw: string

  ready(): void
  expand(): void
  close(): void // @todo Maybe return type is `never`?
}

export function installBasicFunctionality(ctx: Context<BasicFunctionalityFlavor>) {
  ctx.miniApp.version = ctx.launchParams.version as Platform ?? '6.0'
  ctx.miniApp.platform = ctx.launchParams.platform as Platform ?? 'unknown'
  ctx.miniApp.initData = ctx.launchParams.initData ?? {}
  ctx.miniApp.initDataRaw = ctx.launchParams.initDataRaw ?? ''
  ctx.miniApp.ready = () => {
    ctx.eventManager.postEvent('web_app_ready')
  }
  ctx.miniApp.expand = () => {
    ctx.eventManager.postEvent('web_app_expand')
  }
  ctx.miniApp.close = () => {
    ctx.eventManager.postEvent('web_app_close')
  }
}

export type Version = StringWithHints<
  | '6.0'
  | '6.1'
  | '6.2'
  | '6.3'
  | '6.4'
  | '6.5'
  | '6.6'
  | '6.7'
  | '6.8'
  | '6.9'
  | '7.0'
>

export type Platform = StringWithHints<
  | 'android'
  | 'ios'
  | 'macos'
  | 'tdesktop'
  | 'web'
  | 'webk'
  | 'unknown'
>
