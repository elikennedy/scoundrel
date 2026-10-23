# Rules and implementation decisions


Source: [original rules PDF](https://www.stfj.net/art/2011/Scoundrel.pdf), version 1.0, 15 August 2011, by Zach Gage and Kurt Bieg. This remains the documented baseline; the guide research on 24 October 2026 could not freshly verify the complete PDF because its fetch returned 502. See [research and source limitations](guide/research.md). Paraphrased baseline:

- **Setup:** Remove jokers, red aces, and red face cards. Shuffle the 44-card Dungeon. Health starts/caps at 20.
- **Cards:** Clubs/spades are monsters (2–10; J=11, Q=12, K=13, A=14). Diamonds are weapons; hearts are potions (both 2–10).
- **Rooms:** Reveal four. Flee: return them to Dungeon bottom; never consecutively. Otherwise resolve three in any order; retain the fourth for next room.
- **Weapons:** Replace weapons, discarding their attached monsters. Combat damage is `max(0, monster − weapon)`; attach the defeated monster. Subsequent targets must be ≤ the previous attached monster. Barehanded combat costs full monster value; discard that monster.
- **Potions:** Heal their value; discard. Only one heals per turn; discard extras.
- **Ending/scoring:** Die at health ≤0; subtract remaining Dungeon monsters’ values from health. Clear Dungeon: score health; at 20, add the final potion’s value if it was the last card.

### Implementation Clarifications

The engine uses these explicit interpretations of the original rules:

- Weapon targets may have equal or lower value than the last monster slain with that weapon (`≤`). This follows the PDF’s parenthetical wording where its prose is inconsistent.
- Resolving three cards ends a turn and automatically refills the room, carrying its fourth card forward. When the draw pile is empty, continue resolving the remaining cards; a three-card turn still resets the potion allowance. Victory requires clearing both the draw pile and room.
- Flee only before resolving any card in a full four-card room. Return cards to the bottom in their current order without shuffling. Resolve the following room before fleeing again.
- Loss scoring includes unresolved face-up room monsters and monsters in the draw pile. Retain negative health when calculating the score. Death takes precedence if the final combat also clears the dungeon.
- A potion taken at full health consumes the turn’s healing allowance. The final-potion scoring bonus follows the final card’s identity, including a potion discarded after the allowance was used.

These decisions are covered by rule tests and can be revised explicitly if we choose a different variant.


## Player guide

The question-mark control opens the illustrated How to Play guide, including an isolated practice room. Its research and worked examples are recorded in [research notes](guide/research.md). The engine in `src/game/engine.ts` and tests in `tests/game.test.ts` are the executable contract.
