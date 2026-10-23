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
Four room cards on desktop; two columns below 760px. Each card has detached action buttons with a 17px gap. A horizontal adventurer area follows the room; it wraps on mobile. Rules remain collapsed. Keep the title compact.

## Elevation & Depth
Generated candlelit dungeon/table background with a dark overlay. Card and control shadows ground objects on the table. Avoid informational panels surrounding every object.

## Shapes
Preserve the bronze illustrated card template, rounded corners and parchment nameplate. Keep control rectangles separate from the card frame.

## Components
Monster illustrations align top-centre. Type badges and visible playing-card identity subtitles are removed; screen-reader identities remain. Native action buttons include health consequences. Health, equipped weapon art and the generated draw-pile back sit below the room. The ready state shows the generated deck back and a single start action. Reduced-motion users receive no entry animation.

## Do's and Don'ts
Keep gameplay and paintings central. Do not add marketing copy, decorative badges, fabricated lore, or a joined action-panel extension below cards. Keep generated prompts and originals in docs/art.
