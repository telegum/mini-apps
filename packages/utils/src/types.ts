export type Empty = Record<string | number | symbol, never>

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json }

// eslint-disable-next-line ts/ban-types
export type StringWithHints<H extends string> = (string & {}) | H
