import { init } from '@telegum/mini-apps-sdk'
import './style.css'

const {
  version,
  platform,
  initDataRaw,
  initData,
  ready,
  close,
  expand,
  closingConfirmation,
  theme,
  haptic,
  mainButton,
  settingsButton,
  backButton,
  popup,
  alert: miniAppAlert,
  confirm: miniAppConfirm,
  qrScanner,
  requestWriteAccess,
  requestPhone,
} = init()

ready()
expand()

// Main Button

mainButton.text = 'CLOSE MINI APP'
mainButton.onClick(() => close())
const mainButtonToggle = document.getElementById('toggle-main-button') as HTMLButtonElement
function updateMainButtonToggle() {
  mainButtonToggle.innerHTML = `${mainButton.visible ? 'Hide' : 'Show'} Main Button`
}
mainButtonToggle.addEventListener('click', () => {
  mainButton.visible = !mainButton.visible
  updateMainButtonToggle()
})
updateMainButtonToggle()

// Back Button

backButton.onClick(() => alert('Back button clicked.'))
const backButtonToggle = document.getElementById('toggle-back-button') as HTMLButtonElement
function updateBackButtonToggle() {
  backButtonToggle.innerHTML = `${backButton.visible ? 'Hide' : 'Show'} Back Button`
}
backButtonToggle.addEventListener('click', () => {
  backButton.visible = !backButton.visible
  updateBackButtonToggle()
})
updateBackButtonToggle()

// Settings Button

settingsButton.onClick(() => alert('Settings button clicked.'))
const settingsButtonToggle = document.getElementById('toggle-settings-button') as HTMLButtonElement
function updateSettingsButtonToggle() {
  settingsButtonToggle.innerHTML = `${settingsButton.visible ? 'Hide' : 'Show'} Settings Button`
}
settingsButtonToggle.addEventListener('click', () => {
  settingsButton.visible = !settingsButton.visible
  updateSettingsButtonToggle()
})
updateSettingsButtonToggle()

// Popup

const showConfirmButton = document.getElementById('show-confirm') as HTMLButtonElement
showConfirmButton.addEventListener('click', () => {
  miniAppConfirm(
    'Are you sure you want to join a navy?',
  ).then((confirmed) => {
    alert(`Confirmed: ${confirmed}`)
  })
})

const showAlertButton = document.getElementById('show-alert') as HTMLButtonElement
showAlertButton.addEventListener('click', () => {
  miniAppAlert('You\'re becoming a pirate.')
})

const showPopupButton = document.getElementById('show-popup') as HTMLButtonElement
showPopupButton.addEventListener('click', () => {
  popup({
    message: 'Fake popup without title but with buttons of 3 types: "default", "destructive" and "close".',
    buttons: [
      { id: 'send-money', type: 'default', text: 'Send Money' },
      { id: 'delete-all', type: 'destructive', text: 'Delete All' },
      { id: 'close', type: 'close' },
    ],
  }).then(({ pressedButtonId }) => {
    alert(`Pressed button ID: ${pressedButtonId}`)
  })
})

// QR-Scanner

const scanQrOnceButton = document.getElementById('scan-qr-once') as HTMLButtonElement
const scanQrManyButton = document.getElementById('scan-qr-many') as HTMLButtonElement
const scannedQrCodes = document.getElementById('scanned-qr-codes') as HTMLPreElement

scanQrOnceButton.addEventListener('click', () => {
  const unregister = qrScanner.onData((data) => {
    unregister()
    qrScanner.close()
    alert(data)
  })
  qrScanner.open('Try to scan a QR 🔍')
})

scanQrManyButton.addEventListener('click', () => {
  scannedQrCodes.textContent = ''
  const unregisterData = qrScanner.onData((data) => {
    scannedQrCodes.textContent += `${data}\n`
  })
  const unregisterClose = qrScanner.onClose(() => {
    unregisterData()
    unregisterClose()
  })
  qrScanner.open('Scanning until closed...')
})

// Closing Behavior

const enableClosingConfirmationButton = document.getElementById('enable-closing-confirmation') as HTMLButtonElement
const disableClosingConfirmationButton = document.getElementById('disable-closing-confirmation') as HTMLButtonElement

function updateClosingConfirmationButtons() {
  enableClosingConfirmationButton.disabled = closingConfirmation.enabled()
  disableClosingConfirmationButton.disabled = !closingConfirmation.enabled()
}

enableClosingConfirmationButton.addEventListener('click', () => {
  closingConfirmation.enable()
  updateClosingConfirmationButtons()
})

disableClosingConfirmationButton.addEventListener('click', () => {
  closingConfirmation.disable()
  updateClosingConfirmationButtons()
})

updateClosingConfirmationButtons()

// Haptic Feedback

const triggerHapticButton = document.getElementById('haptic-feedback-trigger') as HTMLButtonElement
const triggerHapticSelect = document.getElementById('haptic-feedback-select') as HTMLSelectElement

triggerHapticButton.addEventListener('click', () => {
  haptic(triggerHapticSelect.options[triggerHapticSelect.selectedIndex].value as any)
})

// Permissions

const requestWriteAccessButton = document.getElementById('request-write-access') as HTMLButtonElement
requestWriteAccessButton.addEventListener('click', () => {
  requestWriteAccessButton.disabled = true
  requestWriteAccess()
    .then((granted) => {
      alert(`Write access granted: ${granted}`)
    })
    .finally(() => {
      requestWriteAccessButton.disabled = false
    })
})

const requestPhoneButton = document.getElementById('request-phone') as HTMLButtonElement
requestPhoneButton.addEventListener('click', () => {
  requestPhoneButton.disabled = true
  requestPhone()
    .then((granted) => {
      alert(`Phone shared: ${granted}`)
    })
    .finally(() => {
      requestPhoneButton.disabled = false
    })
})

// Theme & Launch Params

document.getElementById('launch-params')!.innerHTML = JSON.stringify(
  {
    version,
    platform,
    initDataRaw,
    initData,
  },
  null,
  2,
)
document.getElementById('theme')!.innerHTML = JSON.stringify(theme, null, 2)
