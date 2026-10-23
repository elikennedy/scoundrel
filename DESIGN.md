---
name: Scoundrel
description: A candlelit dungeon card table
colors:
  surface: '#11150f'
  text: '#e8dfcd'
  brass: '#bfa16a'
  parchment: '#eddfbd'
  health: '#b75e46'
  frame: '#8a6b40'
  monster: '#762f28'
  weapon: '#17475c'
  potion: '#37553a'
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

An atmospheric desktop fantasy card table. The paintings dominate; bronze image controls and physical card movement carry the surrounding interface. Preserve the user-approved bronze frames, parchment nameplates and dark charcoal/table materials. The guide is a reading surface within this same world.

## Colors

Muted brass, dark oak, charcoal olive and parchment. Card banners use red for monsters, blue for weapons and green for potions. Numeric values, type icons and accessible labels distinguish cards without relying on colour alone. The dark outcome plate provides contrast for bronze skull/chalice artwork and pale text.

## Typography

Georgia supplies card names, headings, numbers and most themed controls; system sans supports functional text. The start screen uses the selected generated `scoundrel-title-v2.webp`, with accessible Scoundrel alternative text. The guide uses generated How to Play and Survival Tactics headings. Use clear numeric card values, including 11–14 for face cards/aces. Do not restore visible playing-card identity subtitles.

## Layout

Desktop only. The table has a 1100px minimum width and four fixed room slots; the play area is at most 1080px wide. The draw pile sits at the left, 102px from the top; discard sits bottom right. The room group begins below the top controls. Keep the room indicator and flee action together above the cards. Health and equipment anchor the lower table with at least 72px of separation from the play area.

The guide is a full-screen vertically scrolling native dialog with a sticky chapter toolbar. Its reading column is at most 1180px with a 1000px minimum. Use generous chapter spacing, short paragraphs and real card illustrations. The practice lesson places cards beside stats, narration and controls so the complete example fits beneath the toolbar at 1280×720.

## Elevation & Depth

The generated dungeon-table painting sits beneath a dark overlay. Card and image-button shadows have physical offsets and soft blur. Moving and landed room cards share the same border, corners and shadow to avoid a landing flash. Do not surround every object with another panel. Transparent outcome/dialog containers let illustrated plate silhouettes define their edges.

## Shapes

Preserve the bronze illustrated card template, 10px room-card corners, top-left value banner and lower parchment nameplate. Monster art stays top-centre to retain heads/crowns; weapons and potions are centred unless the catalogue supplies a crop override. Image controls retain their transparent silhouettes rather than gaining CSS button boxes.

## Components

### Game controls and status

Help and new game use top-right bronze medallions that brighten on hover or keyboard focus without clearing their background images. Both the start-screen deck and Enter the dungeon text action start a new game. Contextual actions float over a hovered or focused card with damage/healing previews and unavailable states. Card emphasis raises the selected card 8px and scales it to 104.5%, while neighbours shrink to 96%; keyboard focus gets the same treatment when there is no hover. Pause emphasis and hide action overlays during busy transitions.

The lower status area uses large health numerals, a recessed bronze-edged health bar and an enlarged equipped-card stack. When unarmed, show the bronze fist and Barehanded label. Do not restore healing-readiness, weapon-discovery or visible action-result prose; retain screen-reader announcements.

### Card travel and piles

Cards keep their slots while a room is being resolved. Before refilling, the survivor slides face up to the rightmost slot in 340ms; skip the slide if already there. Deal new cards from the farthest open slot back towards the left draw pile, one at a time: 640ms travel, 1280ms flip and 50ms pause between cards. Each real card appears as its copy lands.

Resolution travel is 320ms. Weapons move to equipment; weapon kills attach behind it; barehanded kills and potions go to discard. Replacing a weapon discards it and its attached monsters. Flee returns all four cards face down before redealing (320ms travel, 640ms flip, 50ms stagger). Return copies retain full card layout and scale as a whole, rather than reflowing labels/art at deck size.

Hide the whole source card—including overlays and outlines—before starting its visual copy. Restore visibility only after the new slots commit. New game aborts outstanding animations; outcomes wait for the final motion. Reduced motion uses 90ms fades instead of spatial travel/flips and removes card/fan transitions.

Discard is face up, newest card on top. Hover or keyboard focus opens a fan of the last five cards (220ms open, 180ms close); individual hover/focus raises a card for inspection. The hover region covers the expanded fan. Empty piles show a quiet outline.

### Outcome and guide dialogs

Outcomes use the generated dark charcoal plate, bronze skull for defeat or chalice for victory, final score and Play again image button. The native dialog is transparent and borderless. Play again is its only dismissal action; Escape and backdrop interaction do not close it.

How to Play closes with Return to game or Escape. Its chapter jumps focus their headings and respect reduced motion. Keep the combat toggle's pressed states and damage announcement, and the practice lesson's live narration. The practice derives from the real engine but must never alter the live run. Creator credits and researched source links live in the guide; technical interpretations live in [rules](docs/rules.md).

## Do's and Don'ts

Keep gameplay, paintings and readable costs central. Preserve keyboard access and reduced motion. Do not add mobile layouts by default, visible type badges, redundant helper text, promotional copy, invented lore, generic web-app button boxes or a joined action-panel extension below cards. Retain exact prompts and originals through the [artwork index](docs/art/README.md); keep transient review captures out of Git.
