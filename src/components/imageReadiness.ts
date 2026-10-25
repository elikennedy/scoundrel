/** Wait for visible art to decode, while letting restart/unmount release the old deal. */
export function waitForImages(images: readonly { decode: () => Promise<void> }[], signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.resolve()
  return new Promise(resolve => {
    const finish = () => { signal.removeEventListener('abort', finish); resolve() }
    signal.addEventListener('abort', finish, { once: true })
    // A failed image must not lock gameplay; CardFace owns its error placeholder.
    void Promise.allSettled(images.map(image => Promise.resolve().then(() => image.decode()))).then(finish)
  })
}
