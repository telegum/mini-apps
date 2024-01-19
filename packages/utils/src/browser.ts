export function isIframe(): boolean {
  try {
    return window.self !== window.top
  } catch (_) {
    return true
  }
}

export function detectColorScheme(): 'dark' | 'light' | null {
  if (window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
  }
  return null
}
