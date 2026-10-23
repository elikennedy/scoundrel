import { useState } from 'react'
import type { Card } from '../game'
import { cardName } from './cardPresentation'

import { illustrations } from './cardIllustrations'

const suits = { clubs: '♣', spades: '♠', diamonds: '♦', hearts: '♥' }

function TypeIcon({ kind }: { kind: Card['kind'] }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {kind === 'monster' ? <>
        <path d="M10 25C1 20 3 8 5 5c0 8 4 10 8 9m17 11C39 20 37 8 35 5c0 8-4 10-8 9" />
        <path d="M11 14c4-5 14-5 18 0l1 9-5 6-1 7h-8l-1-7-5-6z" />
        <path d="m14 20 4 2-4 2zm12 0-4 2 4 2zM20 25l-2 4h4zM19 31v5m3-5v5" />
      </> : kind === 'weapon' ? <>
        <path d="m9 5 23 23-4 4L5 9V5zm22 0L8 28l4 4L35 9V5zM5 25l10 10m10-10 10 10M9 31l-5 5m27-5 5 5" />
      </> : <>
        <path d="M15 4h10v6l-2 2v5c13 9 13 19-3 19S7 26 17 17v-5l-2-2zM15 8h10M11 26h18" />
        <path d="M18 27v6m-3-3h6" />
      </>}
    </svg>
  )
}

export function CardFace({ card, labelId }: { card: Card; labelId: string }) {
  const art = illustrations[card.id]
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const imageVisible = art?.src && art.src !== failedSource
  // Keep monster heads and crowns in view when the portrait is cropped by the frame.
  const imagePosition = art?.position ?? (card.kind === 'monster' ? '50% 0%' : '50% 50%')
  return (
    <div className={`card-face ${card.kind}`}>
      <div className="card-illustration">
        {imageVisible
          ? <img src={art.src} alt="" style={{ objectPosition: imagePosition }} onError={() => setFailedSource(art.src!)} />
          : <div className="art-placeholder" aria-hidden="true"><TypeIcon kind={card.kind} /><span>Illustration to come</span></div>}
      </div>
      <div className="value-banner" aria-label={`${card.value} ${card.kind === 'monster' ? 'danger' : card.kind === 'weapon' ? 'power' : 'healing'}`}>
        <strong>{card.value}</strong><TypeIcon kind={card.kind} />
      </div>
      <div className="card-nameplate">
        <h3 id={labelId}>{art?.name ?? cardName(card)}</h3>
        <span className="sr-only">{suits[card.suit]} {cardName(card)}</span>
        {art?.flavour && <p className="card-flavour">{art.flavour}</p>}
      </div>
    </div>
  )
}
