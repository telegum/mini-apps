import type { EventManager } from '@telegum/mini-apps-core'
import type { LaunchParams } from '@telegum/mini-apps-core/types'
import type { SyncKvStorage } from '../utils/storage'

// eslint-disable-next-line ts/ban-types
export type Context<A = {}> = {
  launchParams: LaunchParams
  eventManager: EventManager
  storage: SyncKvStorage
  miniApp: A
}
