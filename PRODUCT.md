# Scoundrel

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Players using desktop browsers, including keyboard navigation and reduced motion.

## Product Purpose

Play Scoundrel's 44-card solitaire dungeon game, created by Zach Gage and Kurt Bieg, through an illustrated interface with a pure TypeScript rules engine. Survive the deck while managing health, weapon limits, potions and room choices.

## Positioning

An independent illustrated adaptation with unique catalogue names and art for every playable card, a physical card-table presentation and an integrated rules/practice guide. It is not presented as an official release by the original creators.

## Operating Context

The app runs in a desktop browser without accounts, network services or a runtime backend. Local development uses Node.js 24 LTS, npm, React, TypeScript and Vite. Each new game shuffles a complete deck; reloading loses the current run.

## Capabilities and Constraints

- Four-card rooms; resolve three or flee when legal. The engine owns all validation and scoring.
- All 44 playable cards have local illustrations and catalogue names. Eight illustrated red face cards/aces valued 11–14 form an optional handicap pool; levels 1–4 add that many random distinct cards. Two optional illustrated jokers exchange with a random discarded card or can be discarded. These house rules default off, apply to new games, and exclude runs from high scores.
- Animated dealing, carryover, attack slashes, equipping, discarding and fleeing; face-up last-five discard fan. Individual deals play a local card sound and match its duration. Attacks, bottle use and spent healing-card discards have contextual sound cues.
- Health/equipment status, illustrated victory/death modal, and a How to Play guide with a combat comparison and independent engine-backed practice.
- Desktop only. Keep keyboard operation and reduced-motion alternatives.
- A browser-local top-ten high score table records three-letter initials, final score and completion timestamp. Victories and defeats are eligible; recording is optional. A shared illustrated slate ledger appears beside the outcome and in its own dialog, with a bronze laurel/crown emblem and image controls. A build-time cloud flag reserves a future Firestore adapter, currently unavailable.
- Settings provides optional house rules alongside independent effects/music volume, channel mutes and Mute all, saved in this browser. Harp.mp3 supplies looping background music after an audio-enabled interaction.
- No saved-game system, backend or deployment automation is implemented. Static self-hosting is supported.

## Brand Commitments

Preserve the bronze/parchment card faces, generated bronze wordmarks and image controls, dark table surroundings, and top-aligned monster artwork. Card actions appear over their faces on hover or focus. Do not restore visible type badges, playing-card identity subtitles or redundant activity/helper text.

## Evidence on Hand

Engine and storage tests, AI-generated card and interface artwork, original images, exact prompts, the card catalogue and guide research are included. Source links and creator credits live in the rules documentation and player guide.

## Product Principles

- Keep rules separate from rendering and animation.
- Make health costs and legal actions clear before commitment.
- Let illustrations and physical card movement carry the game presentation.
- Document interpretations rather than silently adopting another adaptation's rules.
- Preserve original assets and prompts without shipping obsolete variants.

## Accessibility & Inclusion

Use native buttons/dialogs, readable labels and values, keyboard-revealed actions, focus management, screen-reader announcements and reduced-motion paths. Accessibility work remains in scope even though mobile layouts do not.

## Open Decisions

Hosted deployment, cloud scores and saved games are possible future work, with no implementation commitment. Add services only when a concrete feature requires them.
