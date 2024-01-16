import type { InitData, ThemeParams } from './common'

/**
 * https://tg.dev/js/telegram-web-app.js
 */
export type RawInitParams = Partial<{
  tgWebAppData: string
  tgWebAppVersion: string
  tgWebAppPlatform: string
  tgWebAppThemeParams: string
  tgWebAppShowSettings: string | boolean
  tgWebAppBotInline: string | boolean
}>

export type InitParams = Partial<{
  initDataRaw: string
  initData: InitData
  version: string
  platform: string
  themeParams: ThemeParams
  showSettings: boolean
  botInline: boolean
}>
