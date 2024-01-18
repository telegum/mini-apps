/**
 * https://corefork.telegram.org/api/bots/webapps#theme-parameters
 */
export type ThemeParams = {
  bg_color: string
  secondary_bg_color: string
  text_color: string
  hint_color: string
  link_color: string
  button_color: string
  button_text_color: string
  header_bg_color: string
  accent_text_color: string
  section_bg_color: string
  section_header_text_color: string
  subtitle_text_color: string
  destructive_text_color: string
}

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
