# Documentation map

Each current concern has one primary home:

| Document | Owns |
| --- | --- |
| [Root README](../README.md) | Status, commands, workspace and next decisions |
| [AGENTS.md](../AGENTS.md) | Agent instructions and project guardrails |
| [PRODUCT.md](../PRODUCT.md) | Confirmed scope, capabilities and open decisions |
| [DESIGN.md](../DESIGN.md) | Visual system, desktop layout, controls and motion timings |
| [Rules](rules.md) | Game rules and deliberate implementation interpretations |
| [Architecture](architecture.md) | Engine API, presentation sequencing and validation |
| [Card catalogue](card-catalogue.md) | User-approved card names and illustration concepts |
| [Card art direction](card-art-direction.md) | Illustration composition and generation constraints |
| [Artwork index](art/README.md) | Originals, selected runtime exports and exact prompts |
| [Guide research](guide/research.md) | External sources, limitations and engine-checked examples |

## Retention and cleanup

Keep original artwork, exact prompts, the supplied reference and meaningful alternate-source provenance. A source image is not orphaned merely because its selected export is different. Only selected assets and the six control sprites belong under `public/art/`.

Do not retain duplicate prompt transcripts, superseded runtime exports or historical screenshots as current documentation. Temporary browser captures go under ignored `.impeccable/review/`; current behaviour must be checked against source and a running build. Generated build/dependency/cache directories are ignored, not documentation.

Update the owning document when behaviour changes, and update links when files move. The illustrated player guide lives in `src/components/HowToPlay.tsx`; it should agree with the rules contract and engine rather than introducing another variant.
