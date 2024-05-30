import { ClickableComponent } from '../utils/clickable-component'
import { State } from '../utils/state'
import type { Context } from './_context'

export type SettingsButtonFlavor = {
  settingsButton: SettingsButton
}

export function installSettingsButton(ctx: Context<SettingsButtonFlavor>) {
  ctx.miniApp.settingsButton = new SettingsButton(ctx)
}

export type SettingsButtonState = {
  visible: boolean
}

class SettingsButton extends ClickableComponent {
  private state: State<SettingsButtonState>

  constructor(private ctx: Context) {
    super()

    this.ctx.eventManager.onEvent('settings_button_pressed', () => {
      if (this.visible) {
        this.triggerOnClick()
      }
    })

    this.state = new State<SettingsButtonState>({
      storage: ctx.storage,
      key: 'SettingsButton',
      initial: () => ({
        visible: false,
      }),
      onBeforeChange: (newState) => {
        this.ctx.eventManager.postEvent('web_app_setup_settings_button', {
          is_visible: newState.visible,
        })
      },
    })
  }

  public get visible(): boolean {
    return this.state.get('visible')
  }

  public set visible(value: boolean) {
    this.state.set('visible', value)
  }

  public hide() {
    this.visible = false
  }

  public show() {
    this.visible = true
  }
}
