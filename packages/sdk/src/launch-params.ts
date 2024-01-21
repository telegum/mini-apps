import { loadLaunchParams } from '@telegum/mini-apps-core'
import type { LaunchParams } from '@telegum/mini-apps-core/types'
import type { SyncKvStorage } from './utils/storage'

export function loadAndStoreLaunchParams({
  storage,
  key,
}: {
  storage: SyncKvStorage
  key: string
}): LaunchParams {
  const loadedLaunchParams = loadLaunchParams()
  const storedLaunchParams = storage.load<LaunchParams>(key) ?? {}

  // Merge launch params.
  const launchParams = ([
    ...Object.keys(loadedLaunchParams),
    ...Object.keys(storedLaunchParams),
  ]).reduce((acc, key_) => {
    const key = key_ as keyof LaunchParams
    const val = acc[key] ?? loadedLaunchParams[key] ?? storedLaunchParams[key]
    if (val) {
      acc[key] = val as any
    }
    return acc
  }, {} as LaunchParams)

  storage.save(key, launchParams)

  return launchParams
}
