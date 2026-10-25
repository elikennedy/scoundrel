# How to Play: research and rule decisions

Researched 24 October 2026. The rendered guide is original explanatory copy with examples evaluated against this project's engine; it does not copy another adaptation's interface or prose.

## Sources reviewed

- Original rules by Zach Gage and Kurt Bieg, version 1.0 (15 August 2011): https://www.stfj.net/art/2011/Scoundrel.pdf. The original remains the project's baseline in the [rules contract](../rules.md). The web fetch returned 502 during this research; the search index provided excerpts, so do not describe this as a fresh complete PDF verification.
- [Howto.cards](https://howto.cards/en/scoundrel/) — detailed cross-reference, including equal-value weapon targets, healing, rooms and scoring. Its proposed endgame handling differs from this engine's three-card turn resets.
- [Scoundrel.gg](https://scoundrel.gg/how-to-play) — cross-reference for weapon limits and combat. Its keyboard shortcuts and UI controls belong to that site and are not copied into this guide.
- [Strategy guide](https://www.scoundrelcardgame.com/strategy) — reviewed weapon sequencing, carrying cards, healing timing, fleeing and counting. That page uses strictly decreasing targets in its examples; our guide explicitly uses equal-or-lower targets.
- A separate Steam adaptation's manual was checked as a secondary source: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3780890/manuals/fabfe7b9333d6965ee169c8e10e49aca1d850c01/manual.pdf?t=1752674085. It is not the creators' original rules and contains variants excluded here.

## Authoritative behaviour in this app

The engine and [rules contract](../rules.md) resolve ambiguities: equal-value targets are legal, death precedes victory, remaining face-up and face-down monsters count in a loss, negative health is retained, and every third resolution resets healing even with an empty draw pile. The final-potion bonus depends on final health and card identity. Changes to the guide should preserve these interpretations unless the engine and rules documentation are deliberately revised.

## Original worked examples

- Practice room starts at 14 health with a power-7 spear, danger-10 troll, healing-6 remedy and danger-12 queen. Equip, fight, heal: 14 → 14 → 11 → 17. The queen carries forward; the weapon's limit is 10.
- Combat comparison: danger 10 against power 7 costs 3, or 10 barehanded.
- Weapon chain with power 7: 12 → 10 → 6 → 6, costing 5, 3, 0, 0. Afterwards a 7 is not a valid weapon target.
- Healing cap: health 16 plus potion 8 reaches 20, restoring only 4.
- Loss: health 3 minus danger 11 leaves −8; unresolved dangers 14 and 6 yield score −28.
- Victory: health 13 scores 13; finishing at 20 with a final value-8 potion scores 28.

The tactics paragraphs are qualitative decisions derived from these mechanics, not promises of a winning strategy. The practice controls affect local demonstration state only.

## Optional house rules

Handicap, jokers, cosmic cards, obstacles and First Blood are user-defined additions to this adaptation, not rules from the sources above. Their exact behaviour is recorded in [Optional house rules](../rules.md#optional-house-rules) and tested in `tests/game.test.ts`, `tests/customCards.test.ts` and `tests/firstBlood.test.ts`. The illustrated guide explains these separately; its practice room continues to use the standard deck.


## Teaching-flow and coverage review — 26 October 2026

Reviewed the complete guide against the local engine, First Blood scheduler, card action controls, optional-rule settings, preview lifecycle and rules contract. This was an implementation/content audit, not a new verification of external sources.

The reading order is controls → standard card types → room loop → combat → weapon limits → healing → fleeing → practice → endings and score saving → tactics → optional rules → credits. Readers learn the mechanics before the worked practice sequence. The House rules chapter proceeds from familiar supply changes (Handicap), through Joker exchanges and obstacle costs/weapon wear, to the four cosmic powers and finally timed First Blood. Each cosmic card has a separate illustration and heading. Topic links reach the five optional groups and each cosmic power.

Coverage includes all four obstacle costs and the pit’s health-only exception, wear below power 2, unchanged target restrictions, no continuing thorn poison, full Fate/Forge/Sight/Mirror prerequisites and resolution/refill behaviour, reveal dismissal, mandatory Mirror completion, and First Blood interactions. The static First Blood illustration shows 0, 2.5 and 5 seconds; prose distinguishes the warning at 5 seconds from the first damage at 6, subsequent ticks, persistent bleeding after healing, action resets, animation exclusion, menus/hidden tabs, pending-exchange death and restart. All five options remain distinct from the creators’ baseline rules.

Browser verification covers chapter/topic focus, obstacle-table rows, all four cosmic entries, combat comparison, practice/reset (14 → 14 → 11 → 17), static timer artwork, and Return/Escape focus restoration at desktop sizes.
