# How to Play: research and rule decisions

Researched 24 October 2026. The rendered guide is original explanatory copy with examples evaluated against this project's engine; it does not copy another adaptation's interface or prose.

## Sources reviewed

- Original rules by Zach Gage and Kurt Bieg, version 1.0 (15 August 2011): https://www.stfj.net/art/2011/Scoundrel.pdf. The original remains the project's baseline in the [rules contract](../rules.md). The web fetch returned 502 during this research; the search index provided excerpts, so do not describe this as a fresh complete PDF verification.
- https://howto.cards/en/scoundrel/ — detailed cross-reference, including equal-value weapon targets, healing, rooms and scoring. Its proposed endgame handling differs from this engine's three-card turn resets.
- https://scoundrel.gg/how-to-play — cross-reference for weapon limits and combat. Its keyboard shortcuts and UI controls belong to that site and are not copied into this guide.
- https://www.scoundrelcardgame.com/strategy — reviewed weapon sequencing, carrying cards, healing timing, fleeing and counting. That page uses strictly decreasing targets in its examples; our guide explicitly uses equal-or-lower targets.
- A separate Steam adaptation's manual was checked as a secondary source: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3780890/manuals/fabfe7b9333d6965ee169c8e10e49aca1d850c01/manual.pdf?t=1752674085. It is not the creators' original rules and contains variants excluded here.

## Authoritative behaviour in this app

The engine and [rules contract](../rules.md) resolve ambiguities: equal-value targets are legal, death precedes victory, remaining face-up and face-down monsters count in a loss, negative health is retained, and every third resolution resets healing even with an empty draw pile. The final-potion bonus depends on final health and card identity. Do not change these rules as part of guide work.

## Original worked examples

- Practice room starts at 14 health with a power-7 spear, danger-10 troll, healing-6 remedy and danger-12 queen. Equip, fight, heal: 14 → 14 → 11 → 17. The queen carries forward; the weapon's limit is 10.
- Combat comparison: danger 10 against power 7 costs 3, or 10 barehanded.
- Weapon chain with power 7: 12 → 10 → 6 → 6, costing 5, 3, 0, 0. Afterwards a 7 is not a valid weapon target.
- Healing cap: health 16 plus potion 8 reaches 20, restoring only 4.
- Loss: health 3 minus danger 11 leaves −8; unresolved dangers 14 and 6 yield score −28.
- Victory: health 13 scores 13; finishing at 20 with a final value-8 potion scores 28.

The tactics paragraphs are qualitative decisions derived from these mechanics, not promises of a winning strategy. The practice controls affect local demonstration state only.
