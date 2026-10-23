---
name: Scoundrel
description: A candlelit dungeon card table
colors:
  surface: '#11150f'
  text: '#e8dfcd'
  brass: '#bfa16a'
  parchment: '#eddfbd'
  health: '#b75e46'
typography:
  display:
    fontFamily: 'Georgia, serif'
    fontWeight: 400
    letterSpacing: '-0.03em'
  body:
    fontFamily: 'system-ui, sans-serif'
rounded:
  control: '4px'
  card: '10px'
spacing:
  control: '8px'
  card: '24px'
---
## Overview
An atmospheric fantasy card table. The card paintings dominate; quiet functional controls recede. User-approved bronze frames and parchment nameplates are preserved.

## Colors
Muted brass, dark oak, charcoal olive, parchment. Existing card banners retain red for monsters, blue for weapons, green for healing, with type icons and accessible labels.

## Typography
Retain the established Georgia card typography. Title and room heading use Georgia; functional controls use the system sans. No promotional subtitles or eyebrow text.

## Layout
Desktop table with four room cards. Bronze image actions float over cards on hover and keyboard focus. Flee sits beside the room indicator. Draw pile sits left; discard pile sits bottom right. Rules occupy a full screen dialog, opened by the top right question medallion alongside new game. The large generated bronze wordmark appears only at the gate, retaining an accessible Scoundrel text alternative.

## Elevation & Depth
Generated candlelit dungeon/table background with a dark overlay. Card and control shadows ground objects on the table. Avoid informational panels surrounding every object.

## Shapes
Preserve the bronze illustrated card template, rounded corners and parchment nameplate. Keep control rectangles separate from the card frame.

## Components
Monster illustrations align top-centre. Type badges and visible playing-card identity subtitles are removed; screen-reader identities remain. Native action buttons include health consequences. Health, equipped weapon art and the generated draw-pile back sit below the room. The ready state shows the generated deck back and a single start action. Reduced-motion users receive no entry animation.

## Do's and Don'ts
Keep gameplay and paintings central. Do not add marketing copy, decorative badges, fabricated lore, or a joined action-panel extension below cards. Keep generated prompts and originals in docs/art.

Game outcomes appear on a generated dark charcoal sculpted image plate over the dimmed table, with a bronze skull for defeat or bronze chalice for victory, final score and Play again action. The dialog itself is transparent and borderless. A generated bronze Play again image button is the only dismissal action; Escape and backdrop interaction do not close it.

## Card motion
Desktop room cards retain four stable slots during a room. Before refilling, the surviving card slides face up into the rightmost slot in 340 ms; a card already there stays put. New cards deal only after this slide finishes. Cards travel from the draw pile face down and flip into place (640 ms travel with a 1280 ms flip per card, dealt sequentially from the farthest open slot back towards the draw pile, with a 50 ms pause between cards; each landed card remains visible immediately). Resolved cards travel face up to their rule-defined destination in 320 ms. Equipped weapons and attached monsters remain visible below the room; replacing a weapon discards the entire prior stack. Flee returns the room face down to the draw pile before redealing. Outcomes wait until the final movement finishes. New game cancels active motion. Reduced motion uses short fades instead of spatial travel or flips.

The discard pile displays the newest face-up card. Hover or focus fans out the last five cards upwards and left; individual hover/focus raises a card for inspection. Empty piles show a quiet outline. Motion lives in the presentation layer; the pure rules engine remains unchanged.

## Adventurer status and card emphasis
The desktop status area anchors the lower table, separated from the room by at least 72px. Larger health numerals and a bronze-edged recessed health bar balance the larger equipped-card display. The unarmed state uses the existing bronze fist medallion and the label Barehanded. Remove healing-readiness and weapon-discovery helper text; potion availability remains reflected by contextual card actions.

Hovering a room card raises it 8px and enlarges it to 104.5%; the other room cards shrink to 96%. Keyboard focus receives the same emphasis when there is no pointer hover. These transforms pause during card travel and change instantly for reduced-motion users.

Card travel hides the whole source card, including action overlays and focus outlines, before its visual copy begins moving. Source visibility is restored after the new room slots commit, preventing remnants or a flash at the old position. Action overlays remain hidden throughout busy transitions.
