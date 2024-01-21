import type { Empty } from '@telegum/mini-apps-utils'
import type { ThemeParams } from './common'

/**
 * https://tg.dev/js/telegram-web-app.js
 */
export type RawLaunchParams = Partial<{
  tgWebAppData: string
  tgWebAppVersion: string
  tgWebAppPlatform: string
  tgWebAppThemeParams: string
  tgWebAppShowSettings: string
  tgWebAppBotInline: string
}>

export type LaunchParams = Partial<{
  initDataRaw: string
  initData: Empty | InitData
  version: string
  platform: string
  themeParams: Partial<ThemeParams>
  showSettings: boolean
  botInline: boolean
}>

/**
 * https://corefork.telegram.org/bots/webapps#webappinitdata
 */
export type InitData = {
  hash: string
  auth_date: number
  query_id?: string
  user?: Omit<User, 'is_bot'>
  receiver?: Omit<User, 'language_code'>
  chat?: Chat
  chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel'
  chat_instance?: string
  start_param?: string
  can_send_after?: number
}

/**
 * https://corefork.telegram.org/bots/webapps#webappuser
 */
export type User = {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code: string
  is_premium?: true
  added_to_attachment_menu?: true
  allows_write_to_pm?: true
  photo_url?: string
}

/**
 * https://corefork.telegram.org/bots/webapps#webappchat
 */
export type Chat = {
  id: number
  type: 'group' | 'supergroup' | 'channel'
  title: string
  username?: string
  photo_url?: string
}
