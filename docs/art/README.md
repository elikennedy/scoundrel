# Artwork index

Card and interface images were generated with OpenAI image generation tools. Exact prompts, source images and selected exports are retained so the assets can be inspected or replaced.

Original artwork created for this repository is covered by the [MIT License](../../LICENSE), with the scope and third-party exclusions set out in [NOTICE](../../NOTICE).

## Cards

All 44 playable cards have unique catalogue names and selected local illustrations. The [catalogue](../card-catalogue.md) owns names/concepts; [art direction](../card-art-direction.md) owns composition and generation constraints.

The [generation manifest](card-generation.jsonl) records the original deck prompts: 44 original cards and one ceramic correction for Witch's Remedy. Every record identifies its retained original, whether it is selected, and its runtime path when selected. All asset paths, including generation sources, are relative to the repository root and point to retained files rather than machine-specific generation caches.

- Originals: `docs/art/originals/` (1024 × 1536 PNGs).
- Selected exports: `public/art/cards/` (WebP, quality 85).
- Selection: `src/components/cardIllustrations.ts` maps every engine card ID to its artwork and name.
- Witch's Remedy: `hearts-6-v2.png` / `hearts-6-v2.webp` is the selected earthenware bottle. `hearts-6.png` is the retained glass draft; its duplicate WebP export was removed.
- Eight high-value red cards and two jokers have generated illustrations for optional house rules; their exact prompts are recorded in [the extension manifest](house-rules-generation.json).

The manifest includes the initial Bog Wraith and Thornsteel Blade illustrations as well as the rest of the deck. See [architecture](../architecture.md#validation) for checks when replacing assets.

## Interface artwork

See the [UI artwork index](ui/README.md) for runtime assets, exact prompts and originals. Keep transparency intact for title/button/emblem artwork. Only selected UI exports and the six control sprites ship under `public/art/ui/`.

## Replacing artwork

Preserve the original and exact prompt, create a versioned export, update the presentation mapping or component reference, and verify it in the app. Once a replacement is selected, remove the unreferenced runtime export while retaining meaningful source provenance. Review screenshots belong in ignored `.impeccable/review/`, not in the art catalogue.

## House-rule additions

[Exact prompts and export mapping](house-rules-generation.json) cover hearts and diamonds 11–14 plus both jokers. Built-in OpenAI image generation produced these assets; source PNGs are retained under `docs/art/originals/` and selected WebP exports under `public/art/cards/`. The [settings cog](ui/settings-medallion.md) extends the bronze interface controls.

Widow’s Lament (`diamonds-12`) and The Last Needle (`diamonds-14`) use the selected `-v2` originals/exports: isolated hovering weapons, with corrected stiletto proportions. Initial drafts and both generations’ exact prompts remain in the extension manifest; superseded runtime exports are removed.
