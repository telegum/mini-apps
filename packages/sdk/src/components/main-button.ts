import { State } from '../utils/state'
import type { Context } from './_context'
import type { ThemingFlavor } from './theming'

export type MainButtonFlavor = {
  mainButton: {
    text: string
    textColor: string
    bgColor: string

    visible: boolean
    hide(): void
    show(): void

    enabled: boolean
    enable(): void
    disable(): void

    loading: boolean
    startLoading(): void
    stopLoading(): void

    onClick(callback: () => void): () => void

    updateProps(patch: Partial<MainButtonState>): void
  }
}

export function installMainButton(ctx: Context<MainButtonFlavor & ThemingFlavor>) {
  ctx.miniApp.mainButton = new MainButton(ctx)
}

export type MainButtonState = {
  text: string
  textColor: string | null
  bgColor: string | null
  visible: boolean
  enabled: boolean
  loading: boolean
}

class MainButton {
  private onClickCallbacks: (() => void)[]
  private state: State<MainButtonState>

  constructor(private ctx: Context<ThemingFlavor>) {
    this.onClickCallbacks = []
    this.ctx.eventManager.onEvent('main_button_pressed', () => {
      if (this.visible && this.enabled) {
        this.onClickCallbacks.forEach(cb => cb())
      }
    })

    this.state = new State<MainButtonState>({
      storage: ctx.storage,
      storageKey: 'MainButton',
      initial: () => ({
        text: 'CONTINUE',
        textColor: null,
        bgColor: null,
        visible: false,
        enabled: true,
        loading: false,
      }),
    })
    this.state.onBeforeChange = (newState) => {
      if (newState.text != null) {
        newState.text = newState.text.trim()
      }

      if (newState.text === '') {
        throw new Error('Main Button text must not be empty')
      }

      if (newState.visible) {
        this.ctx.eventManager.postEvent(
          'web_app_setup_main_button',
          {
            is_visible: newState.visible,
            is_active: newState.enabled,
            is_progress_visible: newState.loading,
            text: newState.text,
            color: newState.bgColor ?? this.ctx.miniApp.theme.colors.buttonBg,
            text_color: newState.textColor ?? this.ctx.miniApp.theme.colors.buttonText,
          },
        )
      } else {
        this.ctx.eventManager.postEvent(
          'web_app_setup_main_button',
          { is_visible: false },
        )
      }

      return newState
    }
  }

  public get text(): string {
    return this.state.get('text')
  }

  public set text(value: string) {
    this.state.set('text', value)
  }

  public get textColor(): string {
    return this.state.get('textColor') ?? this.ctx.miniApp.theme.colors.buttonText
  }

  public set textColor(value: string) {
    this.state.set('textColor', value)
  }

  public get bgColor(): string {
    return this.state.get('bgColor') ?? this.ctx.miniApp.theme.colors.buttonBg
  }

  public set bgColor(value: string) {
    this.state.set('bgColor', value)
  }

  public get visible(): boolean {
    return this.state.get('visible')
  }

  public set visible(value: boolean) {
    this.state.set('visible', value)
  }

  hide() {
    this.visible = false
  }

  show() {
    this.visible = true
  }

  public get enabled(): boolean {
    return this.state.get('enabled')
  }

  public set enabled(value: boolean) {
    this.state.set('enabled', value)
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }

  public get loading(): boolean {
    return this.state.get('loading')
  }

  public set loading(value: boolean) {
    this.state.set('loading', value)
  }

  startLoading() {
    this.loading = true
  }

  stopLoading() {
    this.loading = false
  }

  onClick(callback: () => void): () => void {
    this.onClickCallbacks.push(callback)

    const unsubscribeFn = () => {
      const index = this.onClickCallbacks.indexOf(callback)
      if (index !== -1) {
        this.onClickCallbacks.splice(index, 1)
      }
    }

    return unsubscribeFn
  }

  updateProps(patch: Partial<MainButtonState>) {
    this.state.patch(patch)
  }
}
