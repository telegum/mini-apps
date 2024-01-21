import type { ThemeParams } from '@telegum/mini-apps-core/types'
import { detectColorScheme, hexToRgb, isColorDark } from '@telegum/mini-apps-utils'
import type { Context } from './_context'
import type { BasicFunctionalityFlavor, Platform } from './basic-functionality'

export type ThemingFlavor = {
  theme: {
    colorScheme: ColorScheme
    colors: ThemeColors
  }

  // @todo
  // headerColor: string
  // backgroundColor: string

  // @todo
  // onChange(callback: 123): () => void
}

export function installTheming(ctx: Context<ThemingFlavor & BasicFunctionalityFlavor>) {
  const updateMiniAppTheme = (themeParams: Partial<ThemeParams>) => {
    const [colorScheme, colors] = deduceTheme(
      themeParamsToThemeColors(themeParams),
      ctx.miniApp.platform,
    )
    ctx.miniApp.theme = { colorScheme, colors }
  }

  updateMiniAppTheme(ctx.launchParams.themeParams ?? {})
  ctx.eventManager.onEvent('theme_changed', ({ data }) => {
    updateMiniAppTheme(data)
  })
}

export type ColorScheme = 'light' | 'dark'
export type ThemeColors = {
  bg: string
  bgSecondary: string
  text: string
  hint: string
  link: string
  accent: string
  destructive: string
  buttonBg: string
  buttonText: string
  headerBg: string
  sectionBg: string
  sectionHeaderText: string
  subtitleText: string
}

// @todo: add colors for android, tdesktop, web.
export const DEFAULT_PLATFORM_COLORS: {
  [key in ColorScheme]: {
    [key in Platform]?: ThemeColors
  }
} = {
  light: {
    macos: {
      bg: '#ffffff',
      bgSecondary: '#efeff3',
      text: '#000000',
      hint: '#999999',
      link: '#2481cc',
      accent: '#2481cc',
      destructive: '#ff3b30',
      buttonBg: '#2481cc',
      buttonText: '#ffffff',
      headerBg: '#efeff3',
      sectionBg: '#ffffff',
      sectionHeaderText: '#6d6d71',
      subtitleText: '#999999',
    },
    ios: {
      bg: '#ffffff',
      bgSecondary: '#efeff4',
      text: '#000000',
      hint: '#8e8e93',
      link: '#007aff',
      accent: '#007aff',
      destructive: '#ff3b30',
      buttonBg: '#007aff',
      buttonText: '#ffffff',
      headerBg: '#f8f8f8',
      sectionBg: '#ffffff',
      sectionHeaderText: '#6d6d72',
      subtitleText: '#8e8e93',
    },
  },
  dark: {
    macos: {
      bg: '#282828',
      bgSecondary: '#1c1c1c',
      text: '#ffffff',
      hint: '#ffffff',
      link: '#007aff',
      accent: '#007aff',
      destructive: '#ff453a',
      buttonBg: '#007aff',
      buttonText: '#ffffff',
      headerBg: '#1c1c1c',
      sectionBg: '#282828',
      sectionHeaderText: '#e5e5e5',
      subtitleText: '#ffffff',
    },
    ios: {
      bg: '#000000',
      bgSecondary: '#1c1c1d',
      text: '#ffffff',
      hint: '#98989e',
      link: '#3e88f7',
      accent: '#3e88f7',
      destructive: '#eb5545',
      buttonBg: '#3e88f7',
      buttonText: '#ffffff',
      headerBg: '#1a1a1a',
      sectionBg: '#2c2c2e',
      sectionHeaderText: '#8d8e93',
      subtitleText: '#98989e',
    },
  },
}

const ALL_COLOR_KEYS: (keyof ThemeColors)[] = Object.keys(DEFAULT_PLATFORM_COLORS.light.ios!) as any

function deduceTheme(
  colors: Partial<ThemeColors>,
  platform: Platform,
): [ColorScheme, ThemeColors] {
  const {
    bg,
    bgSecondary,
    link,
    accent,
    buttonBg,
    headerBg,
    sectionBg,
  } = colors

  const someBg = bg ?? bgSecondary ?? headerBg ?? sectionBg
  const colorScheme: ColorScheme = someBg
    ? (isColorDark(hexToRgb(someBg)) ? 'dark' : 'light')
    : (detectColorScheme() ?? 'light')

  if (ALL_COLOR_KEYS.every(key => colors[key] !== undefined)) {
    return [
      colorScheme,
      colors as ThemeColors,
    ]
  }

  const accent_ = accent ?? link ?? buttonBg
  const fallbackColors = (
    DEFAULT_PLATFORM_COLORS[colorScheme][platform]
    ?? DEFAULT_PLATFORM_COLORS[colorScheme].ios!
  )

  return [
    colorScheme,
    {
      ...fallbackColors,
      ...({
        link: link ?? accent_ ?? fallbackColors.link,
        buttonBg: buttonBg ?? accent_ ?? fallbackColors.buttonBg,
        accent: accent_ ?? fallbackColors.accent,
      }),
    },
  ]
}

function themeParamsToThemeColors(
  themeParams: Partial<ThemeParams>,
): Partial<ThemeColors> {
  const map: { [key in keyof ThemeParams]: keyof ThemeColors } = {
    bg_color: 'bg',
    secondary_bg_color: 'bgSecondary',
    text_color: 'text',
    hint_color: 'hint',
    link_color: 'link',
    accent_text_color: 'accent',
    destructive_text_color: 'destructive',
    button_color: 'buttonBg',
    button_text_color: 'buttonText',
    header_bg_color: 'headerBg',
    section_bg_color: 'sectionBg',
    section_header_text_color: 'sectionHeaderText',
    subtitle_text_color: 'subtitleText',
  }

  return Object
    .entries(themeParams)
    .reduce((colors, [key, value]) => {
      if (value && key in map) {
        colors[map[key as keyof ThemeParams]] = value
      }
      return colors
    }, {} as Partial<ThemeColors>)
}
