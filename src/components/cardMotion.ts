
export function cardElement(id: string) {
  return document.querySelector<HTMLElement>(`[data-room-card="${id}"] .card-face`)
}

/** Hide the entire source, including actions and focus outlines, before its copy moves. */
export function hideCardSource(face: HTMLElement) {
  const bounds = face.getBoundingClientRect()
  const source = face.closest<HTMLElement>('.room-card') ?? face
  source.style.visibility = 'hidden'
  return bounds
}

/** A temporary visual copy keeps presentation timing out of the rules engine. */
export async function flyCard(face: HTMLElement, from: DOMRect, to: DOMRect, signal: AbortSignal, options: { flip?: 'reveal' | 'hide'; delay?: number; duration?: number; flipDuration?: number; flat?: boolean; sound?: (delay: number) => () => void } = {}) {
  if (signal.aborted) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  // Returning cards keep their original layout; scaling must not reflow the artwork and nameplate.
  const returning = options.flip === 'hide'
  const layoutWidth = returning ? face.offsetWidth : to.width
  const layoutHeight = returning ? face.offsetHeight : to.height
  const shell = document.createElement('div')
  shell.className = 'flying-card'
  shell.setAttribute('aria-hidden', 'true')
  Object.assign(shell.style, { left: `${to.x}px`, top: `${to.y}px`, width: `${layoutWidth}px`, height: `${layoutHeight}px` })
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
  const duration = reduced && !options.sound ? 90 : options.duration ?? 320
  const timing = { duration, delay: reduced ? 0 : options.delay ?? 0, fill: 'both' as const, easing: 'cubic-bezier(.16,1,.3,1)' }
  const settledTransform = returning ? `scale(${to.width / layoutWidth},${to.height / layoutHeight})` : 'none'
  const transform = reduced ? settledTransform : `translate(${dx}px,${dy}px) scale(${from.width / layoutWidth},${from.height / layoutHeight}) rotate(${options.flat ? 0 : -5}deg)`
  const travel = shell.animate([
    { transform, opacity: reduced ? 0 : 1 },
    ...(reduced && options.sound ? [{ transform: settledTransform, opacity: 1, offset: Math.min(90 / duration, 1) }] : []),
    { transform: settledTransform, opacity: 1 },
  ], timing)
  const reveal = options.flip === 'reveal'
  const hide = options.flip === 'hide'
  const animations = [travel]
  if (!reduced && (reveal || hide)) {
    const flipTiming = { ...timing, duration: options.flipDuration ?? duration * 2 }
    animations.push(front.animate([{ transform: `rotateY(${reveal ? 180 : 0}deg)`, offset: 0 }, { transform: `rotateY(${reveal ? 180 : 0}deg)`, offset: .3 }, { transform: `rotateY(${reveal ? 0 : -180}deg)`, offset: 1 }], flipTiming))
    animations.push(back.animate([{ transform: `rotateY(${reveal ? 0 : 180}deg)`, offset: 0 }, { transform: `rotateY(${reveal ? 0 : 180}deg)`, offset: .3 }, { transform: `rotateY(${reveal ? -180 : 0}deg)`, offset: 1 }], flipTiming))
  } else back.hidden = true
  const stopSound = options.sound?.(timing.delay)
  const cancel = () => { animations.forEach(a => a.cancel()); stopSound?.() }
  signal.addEventListener('abort', cancel, { once: true })
  try { await Promise.all(animations.map(a => a.finished)) } catch { /* Cancelled by a new game or unmount. */ }
  finally { signal.removeEventListener('abort', cancel); stopSound?.(); shell.remove() }
}

/** Both card effects share timing, reduced motion and restart cleanup. */
async function animateCardEffect(face: HTMLElement, effect: SVGSVGElement | HTMLElement, keyframes: Keyframe[], signal: AbortSignal) {
  if (signal.aborted) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  effect.setAttribute('aria-hidden', 'true')
  face.append(effect)
  const animation = effect.animate(reduced ? [{ opacity: .85 }, { opacity: 0 }] : keyframes,
    { duration: reduced ? 90 : 180, easing: 'ease-out', fill: 'both' })
  const cancel = () => animation.cancel()
  signal.addEventListener('abort', cancel, { once: true })
  try { await animation.finished } catch { /* Cancelled by a new game or unmount. */ }
  finally { signal.removeEventListener('abort', cancel); animation.cancel(); effect.remove() }
}

/** Strike the stationary monster before making its travel copy. */
export async function slashCard(face: HTMLElement, signal: AbortSignal) {
  const slash = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  slash.classList.add('attack-slash')
  slash.setAttribute('viewBox', '0 0 100 150')
  slash.setAttribute('preserveAspectRatio', 'none')
  const stroke = document.createElementNS(slash.namespaceURI, 'path')
  stroke.setAttribute('d', 'M 13 17 Q 48 58 88 133 Q 48 88 13 17 Z')
  slash.append(stroke)
  await animateCardEffect(face, slash, [
    { clipPath: 'inset(0 0 100% 0)', opacity: 1, offset: 0 },
    { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: .65 },
    { clipPath: 'inset(0 0 0 0)', opacity: 0, offset: 1 },
  ], signal)
}

/** A radiant counterpart to the attack slash, before a healing card leaves its slot. */
export async function healCard(face: HTMLElement, signal: AbortSignal) {
  const glow = document.createElement('div')
  glow.className = 'healing-radiance'
  await animateCardEffect(face, glow, [
    { transform: 'scale(.4)', opacity: .15, filter: 'brightness(.8)', offset: 0 },
    { transform: 'scale(.95)', opacity: 1, filter: 'brightness(1.5)', offset: .6 },
    { transform: 'scale(1.35)', opacity: 0, filter: 'brightness(1.1)', offset: 1 },
  ], signal)
}
