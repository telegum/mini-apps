import type { InitData, LaunchParams, RawLaunchParams } from './types'

export function loadLaunchParams(): LaunchParams {
  return parseRawLaunchParams(loadRawLaunchParams())
}

export function loadRawLaunchParams(): RawLaunchParams {
  const params = new URLSearchParams(location.hash.slice(1))
  return Object.fromEntries(params.entries())
}

export function parseRawLaunchParams(raw: RawLaunchParams): LaunchParams {
  const parsed: LaunchParams = {}

  if (raw.tgWebAppData) {
    try {
      parsed.initData = parseRawInitData(raw.tgWebAppData)
      parsed.initDataRaw = raw.tgWebAppData
    } catch (_) {}
  }

  if (raw.tgWebAppVersion) {
    parsed.version = raw.tgWebAppVersion.trim()
  }

  if (raw.tgWebAppPlatform) {
    parsed.platform = raw.tgWebAppPlatform.trim()
  }

  if (
    raw.tgWebAppThemeParams
    && raw.tgWebAppThemeParams.startsWith('{')
    && raw.tgWebAppThemeParams.endsWith('}')
  ) {
    try {
      parsed.themeParams = JSON.parse(raw.tgWebAppThemeParams)
    } catch (_) {}
  }

  parsed.showSettings = (
    !!raw.tgWebAppShowSettings
    && raw.tgWebAppShowSettings !== '0'
    && raw.tgWebAppShowSettings !== 'false'
  )
  parsed.botInline = (
    !!raw.tgWebAppBotInline
    && raw.tgWebAppBotInline !== '0'
    && raw.tgWebAppBotInline !== 'false'
  )

  return parsed
}

export function parseRawInitData(raw: string): InitData {
  const params = Object.fromEntries(new URLSearchParams(raw).entries()) as { [k in keyof InitData]?: string }

  const hash = params.hash
  if (!hash) {
    throw new Error('Invalid init data: hash is missing')
  }

  const auth_date = Number.parseInt(params.auth_date ?? '')
  if (Number.isNaN(auth_date)) {
    throw new TypeError('Invalid init data: auth_date is missing or invalid')
  }

  const parsed: InitData = {
    hash,
    auth_date,
  }

  if (params.query_id) {
    parsed.query_id = params.query_id
  }

  if (params.user) {
    parsed.user = JSON.parse(params.user)
  }

  if (params.receiver) {
    parsed.receiver = JSON.parse(params.receiver)
  }

  if (params.chat) {
    parsed.chat = JSON.parse(params.chat)
  }

  if (params.chat_type) {
    parsed.chat_type = params.chat_type as InitData['chat_type']
  }

  if (params.chat_instance) {
    parsed.chat_instance = params.chat_instance
  }

  if (params.start_param) {
    parsed.start_param = params.start_param
  }

  if (params.can_send_after) {
    const can_send_after = Number.parseInt(params.can_send_after)
    if (Number.isNaN(can_send_after)) {
      throw new TypeError('Invalid init data: can_send_after is invalid')
    }
    parsed.can_send_after = can_send_after
  }

  return parsed
}
