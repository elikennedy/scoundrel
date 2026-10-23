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

Game outcomes appear in a centred bronze-framed modal over the dimmed table, with a bronze skull for defeat or bronze chalice for victory, final score and Play again action. Escape or Close returns to the finished table.

## Card motion
Desktop room cards retain four stable slots; the survivor stays in place as new cards refill gaps. Cards travel from the draw pile face down and flip into place (560 ms per card, dealt sequentially; each landed card remains visible immediately). Resolved cards travel face up to their rule-defined destination in 320 ms. Equipped weapons and attached monsters remain visible below the room; replacing a weapon discards the entire prior stack. Flee returns the room face down to the draw pile before redealing. Outcomes wait until the final movement finishes. New game cancels active motion. Reduced motion uses short fades instead of spatial travel or flips.

The discard pile displays the newest face-up card. Hover or focus fans out the last five cards upwards and left; individual hover/focus raises a card for inspection. Empty piles show a quiet outline. Motion lives in the presentation layer; the pure rules engine remains unchanged.
