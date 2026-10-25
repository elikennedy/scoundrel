# Documentation

New here? Start with the [README](../README.md) to run the game, or the [rules](rules.md) to understand it. The in-game question-mark control opens the illustrated guide and practice room.

## Development and design

| Document | What you will find |
| --- | --- |
| [Architecture](architecture.md) | Source layout, engine API, animation lifecycle, storage and validation |
| [Self-hosting](hosting.md) | Static deployment, configuration, updates and troubleshooting |
| [Product scope](../PRODUCT.md) | Capabilities, constraints and possible future work |
| [Design system](../DESIGN.md) | Palette, typography, desktop layout, controls and motion |
| [Rules](rules.md) | Credited baseline, interpretations and every optional house rule |
| [Guide research](guide/research.md) | Source limitations and worked examples |

## Artwork

| Document | What you will find |
| --- | --- |
| [Artwork index](art/README.md) | Original images, exact prompts and selected runtime exports |
| [Card catalogue](card-catalogue.md) | Names and illustration concepts for standard cards and optional house-rule cards |
| [Art direction](card-art-direction.md) | Composition, cropping and replacement guidance |
| [Standard card prompts](art/card-generation.jsonl) | Original deck and retained correction |
| [Red-card and joker prompts](art/house-rules-generation.json) | Handicap/joker originals, revisions and selected exports |
| [Cosmic and obstacle prompts](art/cosmic-barricades-generation.json) | All eight cosmic/obstacle paintings and selected exports |

## Keeping documentation useful

Update the relevant document when behaviour changes. Keep setup in the root README, deployment details in the hosting guide, and technical contracts in architecture and rules. The in-game guide should agree with the engine and documented interpretations.

Retain original artwork and exact prompts in `docs/art/`; only selected runtime images belong in `public/art/`. Keep meaningful source variants, but remove superseded runtime exports and duplicate prompt records after verifying their replacements. Temporary review captures belong in ignored `.impeccable/review/`.

`DESIGN.md` holds the visual contract. `.impeccable/design.json` supplies design-tool previews and extended motion/shadow metadata; it is not used by the running game. Refresh it when the design changes. Machine-specific workspace instructions belong in the ignored local `AGENTS.md`.
