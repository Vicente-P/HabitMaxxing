import '@testing-library/jest-dom'

// jsdom has no <dialog> modal support: emulate showModal/close and Escape (cancel, then close) like a browser.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const cancel = new Event('cancel', { cancelable: true })
      this.dispatchEvent(cancel)
      if (!cancel.defaultPrevented) this.close()
    }
    document.addEventListener('keydown', onKeyDown)
    this.addEventListener('close', () => document.removeEventListener('keydown', onKeyDown), { once: true })
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
