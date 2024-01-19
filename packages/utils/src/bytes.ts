export function strByteSize(str: string): number {
  return new Blob([str]).size
}
