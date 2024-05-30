import type { Json } from '@telegum/mini-apps-utils'
import { deepEqual } from '@telegum/mini-apps-utils'
import type { SyncKvStorage } from './storage'

export class State<T extends Record<string, Json>> {
  private storage: SyncKvStorage
  private storageKey: string
  private initial: (() => T)
  private cached?: T
  private onBeforeChange?: (newState: T, oldState: T) => T | void

  constructor(options: {
    storage: SyncKvStorage
    key: string
    initial: (() => T)
    onBeforeChange?: (newState: T, oldState: T) => T | void
  }) {
    this.storage = options.storage
    this.storageKey = `__MiniApp__State__${options.key}`
    this.initial = options.initial
    this.onBeforeChange = options.onBeforeChange
  }

  load(): T {
    if (!this.cached) {
      this.cached = this.storage.load<T>(this.storageKey) ?? this.initial()
    }
    return this.cached
  }

  save(newState: T) {
    if (this.onBeforeChange) {
      const oldState = this.load()
      if (!deepEqual(oldState, newState)) {
        const maybeNewState = this.onBeforeChange(newState, oldState)
        if (maybeNewState) {
          newState = maybeNewState
        }
      }
    }

    this.storage.save(this.storageKey, newState)
    this.cached = newState
  }

  patch(changes: Partial<T>) {
    const newState = { ...this.load(), ...changes }
    this.save(newState)
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    this.patch({ [key]: value } as unknown as Partial<T>)
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.load()[key]
  }
}
