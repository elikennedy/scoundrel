
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

/** Card effects share timing, reduced motion and restart cleanup. */
async function animateCardEffect(face: HTMLElement, effect: SVGSVGElement | HTMLElement, keyframes: Keyframe[], signal: AbortSignal, duration = 180, particles: { element: HTMLElement; keyframes: Keyframe[] }[] = []) {
  if (signal.aborted) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  effect.setAttribute('aria-hidden', 'true')
  face.append(effect)
  const timing = { duration: reduced ? 90 : duration, easing: 'ease-out', fill: 'both' as const }
  const animations = [effect.animate(reduced ? [{ opacity: .85 }, { opacity: 0 }] : keyframes, timing)]
  if (!reduced) particles.forEach(({ element, keyframes }) => animations.push(element.animate(keyframes, timing)))
  const cancel = () => animations.forEach(animation => animation.cancel())
  signal.addEventListener('abort', cancel, { once: true })
  try { await Promise.all(animations.map(animation => animation.finished)) } catch { /* Cancelled by a new game or unmount. */ }
  finally { signal.removeEventListener('abort', cancel); cancel(); effect.remove() }
}

/** A dry impact: dust billows outward while heavier dirt fragments fall. */
export async function dustCard(face: HTMLElement, signal: AbortSignal) {
  if (signal.aborted) return
  const dust = document.createElement('div')
  dust.className = 'card-dust'
  const particles: { element: HTMLElement; keyframes: Keyframe[] }[] = []
  // Fixed, uneven trajectories keep the burst organic without touching game randomness.
  for (let i = 0; i < 9; i++) {
    const angle = (i * 137.5 + 18) * Math.PI / 180
    const x = Math.cos(angle) * (24 + i % 3 * 9)
    const y = Math.sin(angle) * (15 + i % 4 * 5) - 6
    const cloud = document.createElement('span')
    cloud.className = 'dust-cloud'
    cloud.style.width = `${28 + i % 3 * 7}%`
    cloud.style.height = `${20 + i % 4 * 3}%`
    dust.append(cloud)
    particles.push({ element: cloud, keyframes: [
      { transform: `translate(-50%, -50%) translate(${x * .1}cqw, ${y * .1}cqh) scale(.3)`, opacity: 0, offset: 0 },
      { transform: `translate(-50%, -50%) translate(${x * .5}cqw, ${y * .5}cqh) scale(.85)`, opacity: .8, offset: .22 },
      { transform: `translate(-50%, -50%) translate(${x}cqw, ${y}cqh) scale(1.4)`, opacity: 0, offset: 1 },
    ] })
  }
  for (let i = 0; i < 8; i++) {
    const x = (i % 2 ? 1 : -1) * (14 + i * 4)
    const y = -10 - i % 3 * 7
    const chip = document.createElement('span')
    chip.className = 'dust-chip'
    chip.style.width = `${1.5 + i % 3}%`
    chip.style.height = `${1 + i % 2}%`
    dust.append(chip)
    particles.push({ element: chip, keyframes: [
      { transform: 'translate(-50%, -50%) scale(.4)', opacity: 0, offset: 0 },
      { transform: `translate(${x * .6}cqw, ${y}cqh) rotate(${i * 37}deg)`, opacity: .95, offset: .3 },
      { transform: `translate(${x}cqw, ${y + 30}cqh) rotate(${i * 73 + 90}deg)`, opacity: 0, offset: 1 },
    ] })
  }
  await animateCardEffect(face, dust, [{ opacity: 1 }, { opacity: 1 }], signal, 360, particles)
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

/** Healing and magic share a radiant burst before the card leaves its slot. */
export async function radiateCard(face: HTMLElement, signal: AbortSignal, tone: 'healing' | 'magic' = 'healing') {
  const glow = document.createElement('div')
  glow.className = `card-radiance ${tone}-radiance`
  await animateCardEffect(face, glow, [
    { transform: 'scale(.4)', opacity: .15, filter: 'brightness(.8)', offset: 0 },
    { transform: 'scale(.95)', opacity: 1, filter: 'brightness(1.5)', offset: .6 },
    { transform: 'scale(1.35)', opacity: 0, filter: 'brightness(1.1)', offset: 1 },
  ], signal)
}
