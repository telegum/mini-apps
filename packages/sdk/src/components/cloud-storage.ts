import { strByteSize } from '@telegum/mini-apps-utils'
import type { Context } from './_context'

export type CloudStorageFlavor = {
  cloudStorage: {
    setItem(key: string, value: string): Promise<void>
    getItem(key: string): Promise<string | null>
    getItems<K extends string = string>(keys: K[]): Promise<Record<K, string | null>>
    removeItem(key: string): Promise<void>
    removeItems(keys: string[]): Promise<void>
    getKeys(): Promise<string[]>
  }
}

export function installCloudStorage(ctx: Context<CloudStorageFlavor>) {
  ctx.miniApp.cloudStorage = {
    setItem(key: string, value: string): Promise<void> {
      validateKey(key)
      validateValue(value)
      return ctx.eventManager
        .invokeCustomMethod<boolean>('saveStorageValue', { key, value })
        .then((result) => {
          if (result !== true) {
            throw new Error('Item was not stored in the Cloud Storage')
          }
        })
    },

    getItem(key: string): Promise<string | null> {
      validateKey(key)
      return this
        .getItems([key])
        .then(items => items[key])
    },

    getItems<K extends string>(keys: string[]): Promise<Record<K, string | null>> {
      keys.forEach(validateKey)
      return ctx.eventManager
        .invokeCustomMethod<Partial<Record<K, string>>>('getStorageValues', { keys })
        .then(items => (
          Object.fromEntries(
            keys.map(key => [key, (items as any)[key] ?? null]),
          ) as Record<K, string | null>
        ))
    },

    removeItem(key: string): Promise<void> {
      validateKey(key)
      return this.removeItems([key])
    },

    removeItems(keys: string[]): Promise<void> {
      keys.forEach(validateKey)
      return ctx.eventManager
        .invokeCustomMethod<boolean>('deleteStorageValues', { keys })
        .then((result) => {
          if (result !== true) {
            throw new Error('Items were not deleted from the Cloud Storage')
          }
        })
    },

    getKeys(): Promise<string[]> {
      return ctx.eventManager.invokeCustomMethod('getStorageKeys', {})
    },
  }
}

function validateKey(key: string) {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(key)) {
    throw new Error(`Cloud Storage key "${key}" is invalid, it must be 1-128 characters long, only A-Z, a-z, 0-9, _ and - are allowed`)
  }
}

function validateValue(value: string) {
  const size = strByteSize(value)
  if (size > 4096) {
    throw new Error(`Cloud Storage value is too big, it must be at most 4096 bytes long, but actual size is ${size}`)
  }
}
