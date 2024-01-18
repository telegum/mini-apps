export type Empty = Record<string | number | symbol, never>

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json }
