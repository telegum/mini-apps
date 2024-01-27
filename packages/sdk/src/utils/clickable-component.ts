export class ClickableComponent {
  private onClickCallbacks: (() => void)[] = []

  public onClick(callback: () => void): () => void {
    this.onClickCallbacks.push(callback)

    const unsubscribeFn = () => {
      const index = this.onClickCallbacks.indexOf(callback)
      if (index !== -1) {
        this.onClickCallbacks.splice(index, 1)
      }
    }

    return unsubscribeFn
  }

  protected triggerOnClick() {
    this.onClickCallbacks.forEach(cb => cb())
  }
}
