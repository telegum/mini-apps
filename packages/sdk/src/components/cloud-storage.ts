import { strByteSize } from '@telegum/mini-apps-utils'
import type { Context } from './_context'

export type CloudStorageFlavor = {
  cloudStorage: CloudStorage
}

export function installCloudStorage(ctx: Context<CloudStorageFlavor>) {
  ctx.miniApp.cloudStorage = new CloudStorage(ctx)
}

class CloudStorage {
  constructor(private ctx: Context) {}

  public setItem(key: string, value: string): Promise<void> {
    validateKey(key)
    validateValue(value)
    return this.ctx.eventManager
      .invokeCustomMethod<boolean>('saveStorageValue', { key, value })
      .then((result) => {
        if (result !== true) {
          throw new Error('Item was not stored in the Cloud Storage')
        }
      })
  }

  public getItem(key: string): Promise<string | null> {
    validateKey(key)
    return this
      .getItems([key])
      .then(items => items[key])
  }

  public getItems<K extends string>(keys: string[]): Promise<Record<K, string | null>> {
    keys.forEach(validateKey)
    return this.ctx.eventManager
      .invokeCustomMethod<Partial<Record<K, string>>>('getStorageValues', { keys })
      .then(items => (
        Object.fromEntries(
          keys.map(key => [key, (items as any)[key] ?? null]),
        ) as Record<K, string | null>
      ))
  }

  public removeItem(key: string): Promise<void> {
    validateKey(key)
    return this.removeItems([key])
  }

  public removeItems(keys: string[]): Promise<void> {
    keys.forEach(validateKey)
    return this.ctx.eventManager
      .invokeCustomMethod<boolean>('deleteStorageValues', { keys })
      .then((result) => {
        if (result !== true) {
          throw new Error('Items were not deleted from the Cloud Storage')
        }
      })
  }

  public getKeys(): Promise<string[]> {
    return this.ctx.eventManager.invokeCustomMethod('getStorageKeys', {})
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
