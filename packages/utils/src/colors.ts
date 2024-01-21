export type RgbColor = {
  r: number
  g: number
  b: number
}

export function hexToRgb(hex: string): RgbColor {
  hex = hex.replace(/[\s#]/g, '')
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

export function isColorDark({ r, g, b }: RgbColor) {
  return Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b)) < 120
}
