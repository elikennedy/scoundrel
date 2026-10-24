# Card art direction

The original supplied visual reference is not distributed with this repository. The art direction below and retained original artwork describe the selected visual system.

## Visual target

Dark, gritty, realistically painted fantasy. Weathered materials, muted earth tones, atmospheric fog, dramatic directional lighting, and restrained accents. Subjects must read clearly at room-card size. Create original creatures and weapons; do not reproduce existing illustrations or logos.

## Deterministic layout

The React `CardFace` component owns the frame, typography, values, icons, colours, nameplate, and optional flavour text. Generate the illustration alone: **no text, numbers, borders, ribbons, icons, logos, or UI baked into the art**.

- Weathered bronze frame, portrait composition, artwork filling the upper region.
- Upper-left banner: numeric gameplay value and a fixed vector type icon. Red for monsters, blue for weapons, green for potions. Icons and accessible labels distinguish types without colour; omit redundant type badges.
- Lower parchment nameplate: original card name. Ordinary playing-card identity remains available to screen readers; omit visible identity subtitles.
- Contextual bronze image actions float over the card on hover or keyboard focus, with damage previews and accessible labels. They are not baked into the illustration. Visible names and rules remain crisp at any size.
- Use numeric danger values for black face cards: 11, 12, 13, 14, rather than replacing them with J/Q/K/A on the banner.

## Data and identity

Keep presentation separate from the pure rules engine. Presentation metadata lives in `src/components/cardIllustrations.ts`. Artwork is keyed by the engine’s stable card ID, e.g. `clubs-7` or `diamonds-5`. Presentation fields: `name`, optional `flavour`, optional local `src`, optional CSS `position` for cropping. Monster images default to top-centre alignment to preserve heads, crowns and antlers in the shorter illustration window; weapons and healing cards retain centred alignment. An explicit per-card `position` overrides these defaults. Subject, environment, palette, and danger/power cues belong in the asset brief.

Scoundrel uses 26 distinct monsters valued 2–14, nine weapons valued 2–10, and nine potions valued 2–10. Equal-value monsters in different suits need distinct identities and illustrations. Art must never change card values or mechanics.

The [user-defined card catalogue](card-catalogue.md) is authoritative for names and concepts. All 44 playable cards now have illustrations and catalogue identities connected to CardFace. The user approved the first pair and requested continuation. See the [artwork index](art/README.md) for exact prompts, original images and selected runtime exports. Missing or failed artwork still falls back to a placeholder.

## Generation brief

For each asset, specify card ID, type, value, original name, subject, pose, environment, lighting, palette accents, and composition. Keep a consistent style suffix across the collection:

> Original dark fantasy card illustration, realistic painterly rendering, weathered materials, muted earthy colours, dramatic atmospheric lighting, clear readable silhouette, rich environmental storytelling, portrait composition. Illustration only; no text, numerals, border, nameplate, logos, or interface.

Monsters should escalate from small and vulnerable-looking at low danger to formidable, ancient or supernatural threats at high danger. Weapons should progress from crude, worn tools to masterworked or enchanted arms. Avoid making every high-value weapon a sword; silhouettes and materials should distinguish the entire collection.

Compose the main subject toward the centre/right, leaving the upper-left clear enough for the fixed value banner. Keep important details away from edges so a responsive `object-fit: cover` crop remains usable. Use a consistent portrait source size (approximately 1024 × 1536) and export web-optimised assets to `public/art/cards/<card-id>.webp`. Set `src` explicitly when an asset is ready; do not reference nonexistent files.

## Review for new or replacement art

The original deck is complete. For replacements or extensions, review the crop in the real desktop CardFace, checking readable value/icon/name, subject placement, shared lighting and palette, and danger/power cues. Preserve approved identities and game values. Retain source illustrations separately from selected runtime exports.

## Interface artwork

The generated dungeon-table backdrop and embossed deck back ship from `public/art/ui/`. Their prompts are recorded in [UI artwork index](art/ui/README.md), with source PNGs retained in `docs/art/ui/`. Keep these atmospheric assets separate from the deterministic card frame and functional controls. See [DESIGN.md](../DESIGN.md) for the surrounding game-table layout.
