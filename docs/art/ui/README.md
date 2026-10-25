# UI artwork

Runtime assets are under `public/art/ui/`. This directory holds originals and exact generation prompts. All assets were generated with the built-in image generation tool; transparent outputs preserve alpha through trimming and resizing.

| Runtime asset | Retained original | Prompt record |
| --- | --- | --- |
| `dungeon-table.webp` | [dungeon-table-original.png](dungeon-table-original.png) | [Environment manifest](environment.json) |
| `card-back.webp` | [card-back-original.png](card-back-original.png) | [Environment manifest](environment.json) |
| `control-0.png` … `control-5.png` | [bronze-controls-original.png](bronze-controls-original.png) | [Bronze controls](bronze-controls.md) |
| `bronze-skull.webp` | [bronze-skull-original.png](bronze-skull-original.png) | [Emblems](bronze-emblems.md) |
| `bronze-chalice.webp` | [bronze-chalice-original.png](bronze-chalice-original.png) | [Emblems](bronze-emblems.md) |
| `scoundrel-title-v2.webp` | [scoundrel-title-v2-original.png](scoundrel-title-v2-original.png) | [Selected title](scoundrel-title-v2.md) |
| `result-plate.webp` | [result-plate-original.png](result-plate-original.png) | [Outcome plate](result-plate.md) |
| `play-again.webp` | [play-again-original.png](play-again-original.png) | [Play again](play-again.md) |
| `how-to-play.webp` | [how-to-play-original.png](how-to-play-original.png) | [How to Play](how-to-play.md) |
| `survival-tactics.webp` | [survival-tactics-original.png](survival-tactics-original.png) | [Survival Tactics](survival-tactics.md) |
| `return-to-game.webp` | [return-to-game-original.png](return-to-game-original.png) | [Return to game](return-to-game.md) |
| `high-scores-plate.webp` | [high-scores-plate-original.png](high-scores-plate-original.png) | [High score plate](high-scores-plate.md) |
| `bronze-laurel.webp` | [bronze-laurel-original.png](bronze-laurel-original.png) | [High score emblem](bronze-laurel.md) |
| `save-score.webp` | [save-score-original.png](save-score-original.png) | [Save score](save-score.md) |

Control sprites are help, restart, flee, sword, fist and potion, in that order. The atlas is retained only as their source.

The high score ledger uses its own slate/iron plate and cast-bronze laurel/crown in both the standalone dialog and the outcome view. The laurel also supplies the High scores navigation control. Save score uses its new image button; the standalone ledger reuses Return to game. Headings, initials entry and score rows remain HTML above the decorative artwork. The three new exports retain matching prompt sidecars under `public/art/ui/`; the prompt records above identify their repository-retained originals.

The [original gothic title](scoundrel-title-original.png) and its prompt in [Emblems](bronze-emblems.md) remain as provenance for the selected simpler-serif title. Its unreferenced runtime WebP was removed.

`environment.json` also retains original generator-cache locations for traceability. Runtime code must use the local exports and never depend on those machine-specific cache paths.
