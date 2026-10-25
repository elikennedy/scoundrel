# Rules and implementation decisions

Source: [original rules PDF](https://www.stfj.net/art/2011/Scoundrel.pdf), version 1.0, 15 August 2011, by Zach Gage and Kurt Bieg. This remains the documented baseline; the guide research on 24 October 2026 could not freshly verify the complete PDF because its fetch returned 502. See [research and source limitations](guide/research.md). Paraphrased baseline:

- **Setup:** Remove jokers, red aces, and red face cards. Shuffle the 44-card Dungeon. Health starts/caps at 20.
- **Cards:** Clubs/spades are monsters (2–10; J=11, Q=12, K=13, A=14). Diamonds are weapons; hearts are potions (both 2–10).
- **Rooms:** Reveal four. Flee: return them to Dungeon bottom; never consecutively. Otherwise resolve three in any order; retain the fourth for next room.
- **Weapons:** Replace weapons, discarding their attached monsters. Combat damage is `max(0, monster − weapon)`; attach the defeated monster. Subsequent targets must be ≤ the previous attached monster. Barehanded combat costs full monster value; discard that monster.
- **Potions:** Heal their value; discard. Only one heals per turn; discard extras.
- **Ending/scoring:** Die at health ≤0; subtract remaining Dungeon monsters’ values from health. Clear Dungeon: score health; at 20, add the final potion’s value if it was the last card.

## Implementation clarifications

The engine uses these explicit interpretations of the original rules:

- Weapon targets may have equal or lower value than the last monster slain with that weapon (`≤`). This follows the PDF’s parenthetical wording where its prose is inconsistent.
- Resolving three cards ends a turn and automatically refills the room, carrying its fourth card forward. When the draw pile is empty, continue resolving the remaining cards; a three-card turn still resets the potion allowance. Victory requires clearing both the draw pile and room.
- Flee only before resolving any card in a full four-card room. Return cards to the bottom in their current order without shuffling. Resolve the following room before fleeing again.
- Loss scoring includes unresolved face-up room monsters and monsters in the draw pile. Retain negative health when calculating the score. Death takes precedence if the final combat also clears the dungeon.
- A potion taken at full health consumes the turn’s healing allowance. The final-potion scoring bonus follows the final card’s identity, including a potion discarded after the allowance was used.

These decisions are covered by rule tests and can be revised explicitly if we choose a different variant.

## Player guide

The question-mark control opens the illustrated How to Play guide, including an isolated practice room. Its research and worked examples are recorded in [research notes](guide/research.md). The engine in `src/game/engine.ts` and tests in `tests/game.test.ts` and `tests/customCards.test.ts` are the executable contract.

## Optional house rules

Standard play remains the original 44-card deck. All four house-rule options default off, can be combined, and are saved in this browser. Settings apply only when starting a new game; each run retains its own rules. Any enabled house rule excludes that run from high scores, while its final score is still shown. Later preference changes cannot change eligibility. These additions belong to this adaptation and are not attributed to the original creators.

### Handicap

Handicap 0 (Off) uses no additional red cards. Levels 1–4 randomly choose that many distinct hearts/diamonds valued 11–14 from the eight-card pool, then shuffle them with the standard deck. These use ordinary potion/weapon rules, including the 20-health cap, healing allowance and final-potion bonus.

### Jokers

Jokers in adds two distinct jokers. Discard resolves a joker and counts toward the room’s three resolutions. Play exchanges the joker in its room slot with a uniformly random card from the existing discard pile; the played joker goes on top of discard and cannot select itself. The exchange consumes no resolution and preserves healing allowance. Either joker can retrieve the other. Empty discard disables Play. Both choices commit the player to the room.

### Cosmic cards

Cosmic cards in adds one Hand of Fate, one Forge of Destiny, one Devil’s Sight and one Mirror of Misfortune. Each may be discarded to resolve one room slot, with no activated effect.

- **Hand of Fate — Activate:** discard the hand, return every other unresolved room card to the remaining dungeon, shuffle that combined pile uniformly and deal a fresh room of up to four. Existing discard, health, weapon power and attached monsters are unchanged. The room number advances, resolution count and healing allowance reset, and the usual flee rules apply. Previously resolved cards do not return. The new room may contain a just-returned card. If no cards remain, normal win evaluation applies. Shuffling clears any Devil’s Sight preview.
- **Forge of Destiny — Activate:** discard the forge and resolve its slot. Discard the equipped weapon’s attached monsters and clear its target restriction. Keep the weapon’s current power, including barricade wear. Activation requires an equipped weapon; Discard remains available without one. Third-resolution advancement follows ordinary rules.
- **Devil’s Sight — Activate:** discard the sight, resolve its slot and lose 3 health. Reveal the next three cards still in the dungeon after any automatic room refill, or all remaining cards if fewer. They are not drawn or reordered. The reveal persists until those cards leave the dungeon or a reshuffle clears it; another Sight replaces it with a fresh top-three view. The cost applies even to an empty deck and may be lethal; normal death scoring takes precedence. Discard has no health cost or reveal effect.
- **Mirror of Misfortune — Activate:** discard the mirror and count one resolution, reveal the current top dungeon card, then require the player to exchange it with any remaining room card. The revealed card occupies the chosen card’s position; the chosen room card goes to the top of the dungeon. No other game action is legal until that choice completes, apart from starting/resetting the whole run. The exchange does not spend another resolution, resolve/equip/heal with the incoming card, or alter health, equipment or healing allowance. If this is the third resolution, refill waits until after exchange, so the returned card may immediately be dealt again. Activation requires a top dungeon card and another room card; Discard always remains available. The returned top card stays known until drawn or shuffled.

The four cosmic cards share the purple question-mark motif. Random selection is reproducible in the engine: joker Play receives one sample, and Fate receives the Fisher–Yates shuffle samples from the UI.

### Barricades

Barricades in independently selects a uniform count from 1–4 for each type, adding 4–16 physical cards across wood, rubble, thorns and pits. Every copy has a unique ID and shares its material’s illustration.

| Obstacle | Barehanded | Weapon |
| --- | --- | --- |
| Wooden Barricade | Lose 1 health | Lose no health; reduce power by 1 |
| Rubble | Lose 2 health | Lose no health; reduce power by 2 |
| Poisoned Thorns | Lose 3 health | Lose no health; reduce power by 3 |
| Pit Trap | Lose 1 health | Unavailable |

Clearing a barricade resolves its room slot and sends it to discard. Barehanded clearing leaves equipment unchanged. Pit Traps cannot be cleared with weapons. Poisoned Thorns have no continuing poison effect. Other weapon clearing requires equipment, ignores the monster target restriction and does not change that restriction. A weapon reduced below power 2 is destroyed: discard it and all its attached monsters. A surviving power-2 weapon remains usable. Weapons retain immutable printed rank; wear belongs to the equipped instance. Equipping any weapon starts at its printed power, including a previously discarded card returned by a joker. Forge removes restrictions without repairing wear. Unresolved barricades do not add a monster penalty to defeat scoring.

With all house rules at their maximum, a deck has 70 cards: 44 standard, 4 handicap, 2 jokers, 4 cosmic and 16 obstacles.
