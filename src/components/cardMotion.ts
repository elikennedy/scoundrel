
export function cardElement(id: string) {
  return document.querySelector<HTMLElement>(`[data-room-card="${id}"] .card-face`)
}

/** A temporary visual copy keeps presentation timing out of the rules engine. */
export async function flyCard(face: HTMLElement, from: DOMRect, to: DOMRect, signal: AbortSignal, options: { flip?: 'reveal' | 'hide'; delay?: number; duration?: number } = {}) {
  if (signal.aborted) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const shell = document.createElement('div')
  shell.className = 'flying-card'
  shell.setAttribute('aria-hidden', 'true')
  Object.assign(shell.style, { left: `${to.x}px`, top: `${to.y}px`, width: `${to.width}px`, height: `${to.height}px` })
  const front = face.cloneNode(true) as HTMLElement
  front.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'))
  front.removeAttribute('id')
  front.classList.add('flight-front')
  front.style.visibility = 'visible'
  const back = document.createElement('img')
  back.src = '/art/ui/card-back.webp'
  back.className = 'flight-back'
  shell.append(front, back)
  document.body.append(shell)
  const dx = from.x - to.x, dy = from.y - to.y
  const duration = reduced ? 90 : options.duration ?? 320
  const timing = { duration, delay: reduced ? 0 : options.delay ?? 0, fill: 'both' as const, easing: 'cubic-bezier(.16,1,.3,1)' }
  const transform = reduced ? 'none' : `translate(${dx}px,${dy}px) scale(${from.width / to.width},${from.height / to.height}) rotate(-5deg)`
  const travel = shell.animate([{ transform, opacity: reduced ? 0 : 1 }, { transform: 'none', opacity: 1 }], timing)
  const reveal = options.flip === 'reveal'
  const hide = options.flip === 'hide'
  const animations = [travel]
  if (!reduced && (reveal || hide)) {
    animations.push(front.animate([{ transform: `rotateY(${reveal ? 180 : 0}deg)`, offset: 0 }, { transform: `rotateY(${reveal ? 180 : 0}deg)`, offset: .3 }, { transform: `rotateY(${reveal ? 0 : -180}deg)`, offset: 1 }], timing))
    animations.push(back.animate([{ transform: `rotateY(${reveal ? 0 : 180}deg)`, offset: 0 }, { transform: `rotateY(${reveal ? 0 : 180}deg)`, offset: .3 }, { transform: `rotateY(${reveal ? -180 : 0}deg)`, offset: 1 }], timing))
  } else back.hidden = true
  const cancel = () => animations.forEach(a => a.cancel())
  signal.addEventListener('abort', cancel, { once: true })
  try { await Promise.all(animations.map(a => a.finished)) } catch { /* Cancelled by a new game or unmount. */ }
  finally { signal.removeEventListener('abort', cancel); shell.remove() }
}
