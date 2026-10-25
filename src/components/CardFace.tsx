import { useState } from 'react'
import type { Card } from '../game'
import { cardName } from './cardPresentation'

import { illustrations } from './cardIllustrations'

const suits = { clubs: '♣', spades: '♠', diamonds: '♦', hearts: '♥', jokers: '', cosmic: '', obstacles: '' }

function TypeIcon({ kind }: { kind: Card['kind'] }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {kind === 'monster' ? <>
        <path d="M10 25C1 20 3 8 5 5c0 8 4 10 8 9m17 11C39 20 37 8 35 5c0 8-4 10-8 9" />
        <path d="M11 14c4-5 14-5 18 0l1 9-5 6-1 7h-8l-1-7-5-6z" />
        <path d="m14 20 4 2-4 2zm12 0-4 2 4 2zM20 25l-2 4h4zM19 31v5m3-5v5" />
      </> : kind === 'weapon' ? <>
        <path d="m9 5 23 23-4 4L5 9V5zm22 0L8 28l4 4L35 9V5zM5 25l10 10m10-10 10 10M9 31l-5 5m27-5 5 5" />
      </> : kind === 'joker' || kind === 'cosmic' ? <>
        <path d="m6 28-2-17 11 6 5-13 5 13 11-6-2 17zM7 33h26" /><circle cx="4" cy="9" r="2"/><circle cx="20" cy="3" r="2"/><circle cx="36" cy="9" r="2"/>
      </> : kind === 'barricade' ? <>
        <path d="M5 10h30v24H5zM5 18h30M5 26h30M15 10v8m10 0v8M15 26v8" />
      </> : <>
        <path d="M15 4h10v6l-2 2v5c13 9 13 19-3 19S7 26 17 17v-5l-2-2zM15 8h10M11 26h18" />
        <path d="M18 27v6m-3-3h6" />
      </>}
    </svg>
  )
}

export function CardFace({ card, labelId, loading = 'eager', valueOverride }: { valueOverride?: number; card: Card; labelId: string; loading?: 'eager' | 'lazy' }) {
  const art = illustrations[card.id]
  const mystery = card.kind === 'joker' || card.kind === 'cosmic'
  const displayValue = valueOverride ?? card.value
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const imageVisible = art?.src && art.src !== failedSource
  // Keep monster heads and crowns in view when the portrait is cropped by the frame.
  const imagePosition = art?.position ?? (card.kind === 'monster' || card.kind === 'joker' || card.kind === 'cosmic' ? '50% 0%' : '50% 50%')
  return (
    <div className={`card-face ${card.kind}`} title={art?.description}>
      <div className="card-illustration">
        {imageVisible
          ? <img src={art.src} alt="" loading={loading} decoding="async" style={{ objectPosition: imagePosition }} onError={() => setFailedSource(art.src!)} />
          : <div className="art-placeholder" aria-hidden="true"><TypeIcon kind={card.kind} /><span>Illustration to come</span></div>}
      </div>
      <div className="value-banner" aria-label={mystery ? card.kind === 'joker' ? 'Joker, exchange or discard' : 'Cosmic card, activate or discard' : `${displayValue} ${card.kind === 'monster' ? 'danger' : card.kind === 'weapon' ? 'power' : card.kind === 'barricade' ? card.material === 'pit' ? 'health cost' : 'health or weapon power cost' : 'healing'}`}>
        <strong>{mystery ? '?' : displayValue}</strong><TypeIcon kind={card.kind} />
      </div>
      <div className="card-nameplate">
        <h3 id={labelId}>{art?.name ?? cardName(card)}</h3>
        <span className="sr-only">{suits[card.suit]} {cardName(card)}</span>
        {art?.flavour && <p className="card-flavour">{art.flavour}</p>}
      </div>
    </div>
  )
}
