# Artwork index

Original artwork created for this repository is covered by the [MIT License](../../LICENSE), with the scope and third-party exclusions set out in [NOTICE](../../NOTICE).

## Cards

All 44 playable cards have unique catalogue names and selected local illustrations. The [catalogue](../card-catalogue.md) owns names/concepts; [art direction](../card-art-direction.md) owns composition and generation constraints.

The [generation manifest](card-generation.jsonl) is the single exact-prompt record: 44 original cards and one ceramic correction for Witch's Remedy. Every record identifies its retained original, whether it is selected, and its runtime path when selected. All asset paths, including generation sources, are relative to the repository root and point to retained files rather than machine-specific generation caches.

- Originals: `docs/art/originals/` (1024 × 1536 PNGs).
- Selected exports: `public/art/cards/` (WebP, quality 85).
- Selection: `src/components/cardIllustrations.ts` maps every engine card ID to its artwork and name.
- Witch's Remedy: `hearts-6-v2.png` / `hearts-6-v2.webp` is the selected earthenware bottle. `hearts-6.png` is the retained glass draft; its duplicate WebP export was removed.
- Eight reserved red face-card/ace concepts have no illustrations and remain outside the deck.

The original pair (Bog Wraith and Thornsteel Blade) was user-approved before the remaining 42 were generated. Their exact prompts are now in the same manifest. Historical desktop/mobile review captures and duplicate prompt transcripts were removed; they are not current UI specifications. Current validation belongs in [architecture](../architecture.md).

## Interface artwork

See the [UI artwork index](ui/README.md) for runtime assets, exact prompts and originals. Keep transparency intact for title/button/emblem artwork. Only selected UI exports and the six control sprites ship under `public/art/ui/`.

## Replacing artwork

Preserve the original and exact prompt, create a versioned export, update the presentation mapping or component reference, and verify it in the app. Once a replacement is selected, remove the unreferenced runtime export while retaining meaningful source provenance. Review screenshots belong in ignored `.impeccable/review/`, not in the art catalogue.
