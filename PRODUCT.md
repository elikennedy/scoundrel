# Scoundrel

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A personal single-player browser game. Current work targets desktop play.

## Product Purpose

Play Scoundrel's 44-card solitaire dungeon game, created by Zach Gage and Kurt Bieg, through an illustrated interface with a pure TypeScript rules engine. Survive the deck while managing health, weapon limits, potions and room choices.

## Positioning

A personal illustrated adaptation with unique catalogue names and art for every playable card, a physical card-table presentation and an integrated rules/practice guide. It is not presented as an official release by the original creators.

## Operating Context

The app runs in a desktop browser without accounts, network services or a runtime backend. Local development uses Node.js 24 LTS, npm, React, TypeScript and Vite. Each new game shuffles a complete deck; reloading loses the current run.

## Capabilities and Constraints

- Four-card rooms; resolve three or flee when legal. The engine owns all validation and scoring.
- All 44 playable cards have local illustrations and catalogue names. Eight reserved red face-card/ace concepts are excluded from play.
- Animated dealing, carryover, equipping, discarding and fleeing; face-up last-five discard fan.
- Health/equipment status, illustrated victory/death modal, and a How to Play guide with a combat comparison and independent engine-backed practice.
- Desktop only by the user's explicit request. Keep keyboard operation and reduced-motion alternatives.
- No saved-game system, leaderboard, backend or deployment target is currently implemented.

## Brand Commitments

Preserve the bronze/parchment card faces, generated bronze wordmarks and image controls, dark table surroundings, and top-aligned monster artwork. Card actions appear over their faces on hover or focus. Do not restore visible type badges, playing-card identity subtitles or redundant activity/helper text.

## Evidence on Hand

The executable engine and 14 tests, all local card/UI artwork, the supplied visual reference, exact generation prompts, the user-defined catalogue, and guide research are retained in the repository. Source links and original creators' credit live in the rules documentation and player guide.

## Product Principles

- Keep rules separate from rendering and animation.
- Make health costs and legal actions clear before commitment.
- Let illustrations and physical card movement carry the game presentation.
- Document interpretations rather than silently adopting another adaptation's rules.
- Preserve original assets and prompts without shipping obsolete variants.

## Accessibility & Inclusion

Use native buttons/dialogs, readable labels and values, keyboard-revealed actions, focus management, screen-reader announcements and reduced-motion paths. Accessibility work remains in scope even though mobile layouts do not.

## Open Decisions

Deployment and saved-game behaviour. Add services only when a concrete feature requires them.
