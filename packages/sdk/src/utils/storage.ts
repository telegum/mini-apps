import type { Json } from '@telegum/mini-apps-utils'

export interface SyncKvStorage {
  save(key: string, value: Json): void
  load<T extends Json>(key: string): T | undefined
  delete(key: string): void
}

export const sessionSyncKvStorage: SyncKvStorage = {
  save(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value))
  },
  load(key) {
    const value = sessionStorage.getItem(key)
    return value ? JSON.parse(value) : undefined
  },
  delete(key) {
    sessionStorage.removeItem(key)
  },
}
