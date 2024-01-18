export function isIframe(): boolean {
  return (window.parent != null && window !== window.parent)
}
