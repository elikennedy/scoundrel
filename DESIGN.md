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
  attack: '#cb302a'
  healing: '#f4ce79'
  weapon: '#17475c'
  potion: '#37553a'
  joker: '#563c62'
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

**Creative North Star: "A candlelit dungeon card table"**

An atmospheric desktop fantasy card table. The paintings dominate; bronze image controls and physical card movement carry the surrounding interface. Bronze frames, parchment nameplates and dark charcoal/table materials give the cards their physical character. The guide is a reading surface within this same world.

**Key Characteristics:**

- Painted cards with bronze frames and parchment nameplates.
- Physical card movement across a desktop table.
- Illustrated controls with keyboard access and reduced motion.
- Slate Settings dialog with side-by-side audio and optional house rules.

## Colors

Muted brass, dark oak, charcoal olive and parchment. Card banners use red for monsters, blue for weapons, green for potions and muted purple for jokers and cosmic cards. Barricades reuse the frame bronze for their banners. Numeric values, type icons and accessible labels distinguish cards without relying on colour alone; jokers and cosmic cards use a question mark and crown instead of a numerical power. All four obstacles pair their 1–3 cost with a wall icon; Pit Trap’s accessible banner specifies health cost only. The brighter attack red marks a single strike before a monster leaves its slot. The dark outcome plate provides contrast for bronze skull/chalice artwork and pale text.

## Typography

Georgia supplies card names, headings, numbers and most themed controls; system sans supports functional text. The start screen uses the selected generated `scoundrel-title-v2.webp`, with accessible Scoundrel alternative text. The guide uses generated How to Play and Survival Tactics headings. Use clear numeric card values, including 11–14 for face cards/aces; optional jokers and cosmic cards show ? because they have no numerical power. Do not restore visible playing-card identity subtitles.

## Layout

Desktop only. The table has a 1100px minimum width and four fixed room slots; the play area is at most 1080px wide. The draw pile sits at the left, 102px from the top; discard sits bottom right. The room group begins below the top controls. Keep the room indicator and flee action together above the cards. Health and equipment anchor the lower table with at least 72px of separation from the play area.

The guide is a full-screen vertically scrolling native dialog with a sticky chapter toolbar. Its reading column is at most 1180px with a 1000px minimum. Use generous chapter spacing, short paragraphs and real card illustrations. The practice lesson places cards beside stats, narration and controls so the complete example fits beneath the toolbar at 1280×720.

## Elevation & Depth

The generated dungeon-table painting sits beneath a dark overlay. Card and image-button shadows have physical offsets and soft blur. Moving and landed room cards share the same border, corners and shadow to avoid a landing flash. Do not surround every object with another panel. Transparent outcome/dialog containers let illustrated plate silhouettes define their edges.

## Shapes

Preserve the bronze illustrated card template, 10px room-card corners, top-left value banner and lower parchment nameplate. Monster, joker and cosmic art stays top-centre to retain heads/crowns; weapons and potions are centred unless the catalogue supplies a crop override. Image controls retain their transparent silhouettes rather than gaining CSS button boxes.

## Components

### Game controls and status

New game, Settings, high scores and How to play appear left to right as top-right bronze controls that brighten on hover or keyboard focus without clearing their background images. Settings uses a bronze cog in place of the speaker. All four navigation buttons are 68px square with artwork fitted to identical 224px bounds on 256px transparent canvases. High scores uses a laurel wreath contained in a bronze ring; the unringed laurel remains in the ledgers. Dark bronze-edged parchment-text tooltips appear on hover or keyboard focus, remain hoverable, and dismiss with Escape. Both the start-screen deck and Enter the dungeon text action start a new game. Contextual actions float over a hovered or focused card with damage/healing previews and unavailable states. Card emphasis raises the selected card 8px and scales it to 104.5%, while neighbours shrink to 96%; keyboard focus gets the same treatment when there is no hover. Pause emphasis and hide action overlays during busy transitions.

The lower status area uses large health numerals, a recessed bronze-edged health bar and an enlarged equipped-card stack. The equipped card banner and adjacent status display current weapon power, including barricade wear, while the catalogue card retains its printed rank. When unarmed, show the bronze fist and Barehanded label. Do not restore healing-readiness, weapon-discovery or visible action-result prose; retain screen-reader announcements.

### Card travel and piles

Cards keep their slots while a room is being resolved. Before refilling, the survivor slides face up to the rightmost slot in 340ms; skip the slide if already there. Deal new cards from the farthest open slot back towards the left draw pile, one at a time: travel and flip both match the decoded duration of `public/sound/card-dealt.wav` (currently about 733ms), with a 50ms pause between cards. One sound starts with each card and finishes as it lands. Each real card appears as its copy lands. Live card art stays eager and is decoded before its flight; defer unopened dialog artwork and lazy-load guide illustrations to keep the title screen light.

Attacking a monster draws a red slash from upper left to lower right in 180ms before resolution travel; reduced motion uses a stationary 90ms fade. Clearing Wooden Barricade, Rubble, Poisoned Thorns or Pit Trap instead produces a 360ms physical impact: nine uneven earth-brown dust billows expand and dissipate while eight dirt fragments scatter and fall, bounded to the card face. The dust palette uses sand #c5ab87, dry earth #a38a68, shaded soil #79634b and debris #887052. Reduced motion uses a stationary 90ms dust fade without fragment travel. Using a healing card produces a soft, diffuse ball of golden radiance that brightens, expands and fades over the same 180ms. Playing a joker or activating any cosmic card uses the same burst geometry and timing in purple. Reduced motion gives both radiance colours the same stationary 90ms fade. Spent healing-card discards and joker/cosmic Discard actions skip the burst. Healing use at full health still shows the golden burst because it consumes the healing allowance. Remove each effect before copying the card, and cancel it on restart.

Resolution travel is 320ms. Weapons move to equipment; weapon kills attach behind it; barehanded kills and potions go to discard. Replacing a weapon discards it and its attached monsters. Flee returns all four cards face down before redealing (320ms travel, 640ms flip, 50ms stagger). Return copies retain full card layout and scale as a whole, rather than reflowing labels/art at deck size.

Hide the whole source card—including overlays and outlines—before starting its visual copy. Restore visibility only after the new slots commit. New game aborts outstanding animations; outcomes wait for the final motion. Reduced motion uses 90ms fades instead of spatial travel/flips and removes card/fan transitions. During dealing, the face fades in over 90ms and holds for the rest of the sound, keeping cards and audio sequential.

Discard is face up, newest card on top. Hover or keyboard focus opens a fan of the last five cards (220ms open, 180ms close); individual hover/focus raises a card for inspection. The hover region covers the expanded fan. Empty piles show a quiet outline.

Devil’s Sight and Mirror activation open a temporary, untitled card popover beside the draw pile. The dark surface retains its bronze border, 4px corners, miniature painted cards and ordered Next/Then/Third captions. Sight is 448px wide with three columns and 12px gaps; Mirror is 228px wide with a centred 160px card. Padding is 38px at the top and 14px on the other edges. A 32px X button sits 4px from the upper-right corner with a drawn cross and an accessible Close revealed cards label. There is no heading, count, disclosure, collapsed bar or reopen control. Closing with X or Escape inside the popover dismisses that reveal permanently and returns focus to the room heading. The next accepted game action also clears it, including Mirror exchange and restart. New reveal activations can open a fresh preview; engine-known cards never reopen a dismissed one. A short instruction above the room continues to identify the mandatory Mirror exchange even after its preview is dismissed. No popover animation is needed.

### Settings

The Settings dialog reuses the outcome's illustrated slate plate with a bronze cog medallion and a visible Settings heading. The medallion and Return to game artwork sit inward from the top and bottom rim. At 1280×720, audio and Optional house rules sit side by side in equal columns separated by 48px on the same 1160px-wide plate. Content uses a minimum height of `min(800px, calc(100svh - 24px))`, 144px horizontal padding and `clamp(64px, 7svh, 96px)` vertical padding. Font sizes stay unchanged as the surface expands. The cog is 56px square; house-rule supporting paragraphs use 6px top and 8px bottom margins. The heading has a 10px bottom gap; adjacent house-rule rows use 12px spacing. A full-width next-game/high-score note sits below both columns with 12px of space before the Return control. At desktop heights up to 780px, tighten heading and house-rule paragraph/row gaps to preserve at least 64px of top and bottom clearance while fitting the 696px-tall dialog at 1280×720 without reducing type or control sizes. No additional panel frames are needed inside the slate surface.

The audio column has two stacked rows pairing a labelled native range input and percentage with an illustrated mute control: Sound effects, then Music. Bronze rails and circular metal thumbs carry the existing palette. Muted channel controls add a diagonal parchment stroke and a Muted label. Mute all sits below both channels, with a short status line when active. Sliders retain their values when muted. Mute all preserves individual channel mute states. Audio preferences persist in the browser; defaults are 100% sound effects and 35% music. The local Harp.mp3 track loops after the first room lands or an audio-enabled Settings interaction, continuing through game restarts and pausing in hidden tabs.

The house-rules column uses labelled native selects with dark inset fills, bronze borders, parchment text and Georgia labels. Handicap offers Off and 1–4 extra cards; Jokers offers Jokers out and Jokers in. Cosmic cards and Barricades each offer independent in/out selects. First Blood uses a labelled 22px native bronze checkbox with linked supporting text. All house rules default off, persist in this browser and apply to the next new game; older stored choices keep their handicap/joker values. Supporting text explains the random hearts/diamonds valued 11–14, independent 1–4 wood/rubble/thorns/pit counts and the separate House rules score board. The shared Return to game image button anchors the bottom. Escape also closes the dialog and focus returns to its opener.

### Optional cards and joker actions

The eight optional hearts/diamonds valued 11–14 and two jokers reuse the existing painted-card frame and parchment nameplate, with catalogue names, browser-title descriptions and retained original artwork. Hearts and diamonds keep their potion/weapon colours and icons. Each handicap game adds the selected number of distinct random cards from that eight-card pool.

Jokers use the muted-purple banner, question mark and jester crown. Their contextual actions are Play and Discard. Discard resolves the joker normally. Play sends the joker to discard and returns a random prior discard to the same room slot without counting a resolution or resetting healing; the returned card travels face up from discard in 320ms. Both choices commit the room, preventing flee. A house-rules outcome uses the same final-score, Play again and score-entry layout as standard play, labelled House rules.

### Cosmic cards and barricades

Four cosmic cards and four obstacle paintings extend the same bronze/parchment card template, catalogue descriptions and retained-art workflow. Cosmic cards reuse the joker purple, question mark and crown. Activate and Discard actions appear in the established hover/focus overlay; Activate previews New room, Reset limit, −3 HP · Reveal or Reveal & swap. Forge requires an equipped weapon. Mirror requires a dungeon card and another room card; its Discard action remains available when Activate is disabled. Barricades reuse bronze cost banners and a geometric wall icon; wood, rubble and thorns offer Weapon/Barehanded actions previewing power wear, Breaks weapon or health cost before commitment. Pit Trap offers only Clear with a 1 HP preview and preserves equipment.

Hand of Fate discards itself, returns the unresolved room face down to the dungeon and deals a fresh room using the existing cancellable return/deal flights. The fresh room resets resolutions, healing allowance and flee eligibility. Forge resolves its slot, clears the weapon target restriction and sends attached trophies to discard using existing flights, preserving reduced power. All four cosmic activations use the purple radiance before discard travel. Sight costs 3 health and reveals up to three dungeon cards after any room refill. Wood, rubble and Poisoned Thorns cost 1, 2 and 3 health/power respectively; weapon use loses no health, retains target restrictions and destroys a weapon below 2 power along with its attached trophies. Thorns have no ongoing poison effect. Pit Trap costs 1 health and offers no weapon action. All custom runs keep their final score and can save to the House rules ledger.

Mirror discards itself and resolves its slot before revealing the dungeon top. Every remaining room card then exposes only Exchange in the existing hover/focus overlay. The player must choose one before any further game action, apart from restarting the whole run. The incoming card replaces that room card without resolving, equipping or healing; the outgoing card returns to the dungeon top and becomes known. The exchange costs no health or extra resolution, and preserves equipment and healing allowance. A third-resolution refill waits for the exchange and can immediately deal the returned card. New game clears the pending choice and cancels its motion. Exchange travel reuses the shared cancellable flights and reduced-motion fades.

### First Blood

A 72px transparent circular timer sits centred 24px above the discard pile while bleeding. The faint white 1px outline has no text inside. A translucent blood-red pie sector starts at twelve o’clock and fills clockwise from empty to full over the existing five-second grace period. At five seconds it is replaced in the same position by the transparent blood-painted BLEEDING wordmark, displayed at 140px wide within a 72px-high area. The image pulses smoothly from 0% to 100% opacity and back over a two-second cycle. Music plays at 2× speed with pitch roughly half an octave lower while this warning is active, returning to 1× and its original pitch when an action renews grace, during card motion or when the run ends; sound effects keep their normal timing. Accepted actions immediately restore the empty circle, including during card motion. It never receives pointer events or affects discard layout/fan controls; reduced motion removes fill interpolation and holds the warning image at full opacity while preserving timing updates.

The health panel adds a compact Georgia status: First Blood · Unwounded before damage, a whole-second grace countdown after damage/actions, then −1 HP / second. Keep it quiet for screen readers (`role="timer"`, no per-frame live announcements); actual health loss uses the existing announcement region. Every accepted gameplay action renews five seconds; card motion does not consume thinking time. Menus and background tabs keep bleeding active. Healing never cures it. How to Play includes the timed rule beside its existing house-rule and score guidance.

While bleeding in a live game, cover the viewport with a steady #b50c16 tint, including controls and native dialogs. Opacity is `0.025 + 0.43 × ((20 − clampedHealth) / 19)^1.3`, ranging from barely perceptible at 20 HP to strong translucent red at 1 HP. The overlay never receives pointer events. Native dialogs supply their own full-screen tint and suppress the underlying tint so it is applied only once. Health changes ease opacity over 180ms; reduced motion uses an immediate steady update. Keep the full-screen tint steady; only the small BLEEDING wordmark pulses. Outcomes and new unwounded games clear the tint.

### High score ledger

A dark slate plate and bronze laurel/crown frame the shared score ledger, used beside every outcome and in a standalone dialog. The standalone ledger has Original rules and House rules text buttons with native pressed states, parchment labels and a bronze underline on the selected board. Each board keeps an independent top ten. Outcome ledgers show a fixed board label above initials entry, derived from the run’s starting rules. The initials field uses a bronze border, parchment text and widely spaced Georgia capitals. Score rows stay HTML with tabular numerals; a bounded scrolling region keeps ten entries inside the plate. Save score and Return to game use transparent bronze image buttons. Disabled and pending states remain visible; errors appear as text within the ledger. The standalone dialog closes with Return to game or Escape and restores focus to its opener.

### Outcome and guide dialogs

Outcomes use the generated dark charcoal plate, bronze skull for defeat or chalice for victory, final score and Play again image button. The native dialog is transparent and borderless. Play again is its only dismissal action; Escape and backdrop interaction do not close it.

How to Play closes with Return to game or Escape. Teach controls and card types before rooms, combat and weapon limits, then healing, fleeing and the isolated practice room. Follow with endings/score saving, tactics, optional rules and creator credits. The toolbar links Basics, Rooms, Combat, Practice, Scoring and House rules. Chapter and topic jumps focus their heading and leave it clear of the sticky toolbar; respect reduced motion. Preserve the combat comparison and its pressed states, and the practice’s engine-derived 14 → 14 → 11 → 17 health sequence. Practice controls and the longest narration fit at 1280×720; practice never changes the live run.

The House rules chapter starts with default-off, saved, next-game and separate-board policy, then teaches Handicap, Jokers, obstacles, cosmic cards and First Blood. Local text jump links reach each group and each of the four cosmic cards. Obstacles have one full-width semantic cost table for wood, rubble, thorns and pits, followed by the illustrated health/power/breakage and thorns/trap explanations. Cosmic cards have separate illustrated entries for Hand of Fate, Forge of Destiny, Devil’s Sight and Mirror of Misfortune. Keep the 360px artwork column, 64px text gap, paired obstacle/joker/supply examples and centred 180px single cosmic cards. Explain costs and unavailable actions, resolution/refill consequences, temporary previews, weapon wear versus target limits, and the mandatory Mirror exchange.

First Blood includes static, labelled 0-second, 2.5-second and 5-second indicator examples, using the existing transparent blood wordmark without animation in the guide. Explain triggering health costs, persistent bleeding despite healing, action resets, exact grace/tick boundaries, card-animation exclusion, menus/background tabs, Mirror death, tint strength and restart. Mention the active timer near the guide introduction. Keep separate Original rules/House rules score guidance beside endings. Sources and creator credits remain at the end; authoritative interpretations live in [rules](docs/rules.md).

## Do's and Don'ts

- Keep gameplay, paintings and readable costs central.
- Preserve keyboard access and reduced motion.
- Retain exact prompts and originals through the [artwork index](docs/art/README.md); keep transient review captures out of Git.
- Do not add mobile layouts by default, visible type badges, redundant helper text, promotional copy, invented lore, generic web-app button boxes or a joined action-panel extension below cards.
