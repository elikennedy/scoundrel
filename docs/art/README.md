# Artwork index

Card and interface images were generated with OpenAI image generation tools. Exact prompts, source images and selected exports are retained so the assets can be inspected or replaced.

Original artwork created for this repository is covered by the [MIT License](../../LICENSE), with the scope and third-party exclusions set out in [NOTICE](../../NOTICE).

## Cards

The standard deck has 44 unique paintings. Optional house rules add 18 concepts: eight high-value red cards, two jokers, four cosmic cards and four obstacle materials. All 62 selected paintings have local WebP exports. Multiple copies of an obstacle share its painting. The [catalogue](../card-catalogue.md) owns names and concepts; [art direction](../card-art-direction.md) owns composition and generation constraints.

| Manifest | Retained generations |
| --- | --- |
| [Standard deck](card-generation.jsonl) | 44 initial cards and the ceramic correction for Witch’s Remedy |
| [High red cards and jokers](house-rules-generation.json) | Ten concepts, including revised hovering weapons for diamonds 12 and 14 |
| [Cosmic cards and obstacles](cosmic-barricades-generation.json) | Eight concepts and their selected exports |

Every record identifies its exact prompt, retained original, selection status and runtime path when selected. Paths are relative to the repository root; no machine-specific generation cache is needed.

- Originals: `docs/art/originals/` (1024 × 1536 PNGs).
- Selected exports: `public/art/cards/` (WebP, quality 85).
- Selection: `src/components/cardIllustrations.ts` maps engine card IDs to artwork, names and descriptions.
- Selected revisions: Witch’s Remedy uses `hearts-6-v2`; Widow’s Lament and The Last Needle use `diamonds-12-v2` and `diamonds-14-v2`. Meaningful drafts and exact prompts remain in the manifests; superseded runtime exports are removed.

See [architecture](../architecture.md#validation) for checks when replacing assets.

## Interface artwork

See the [UI artwork index](ui/README.md) for runtime assets, exact prompts and originals. Keep transparency intact for title/button/emblem artwork. Only selected UI exports and the six control sprites ship under `public/art/ui/`.

## Replacing artwork

Preserve the original and exact prompt, create a versioned export, update the presentation mapping or component reference, and verify it in the app. Once a replacement is selected, remove the unreferenced runtime export while retaining meaningful source provenance. Review screenshots belong in ignored `.impeccable/review/`, not in the art catalogue.
