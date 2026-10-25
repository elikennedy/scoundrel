# Scoundrel

An illustrated, single-player browser adaptation of the dungeon-crawling card game by **Zach Gage and Kurt Bieg**. Survive a 44-card dungeon by choosing when to fight, equip weapons, heal, or flee.

This is an independent adaptation, built with React, TypeScript and Vite. It includes a How to Play guide with an interactive practice room, animated card movement, and a local high score table. Card and interface artwork is AI-generated; original images and prompts are included.

Desktop browsers only. Keyboard controls and reduced motion are supported. The game runs entirely in your browser without an account or backend. Refreshing starts over; high scores and audio preferences persist.

## Run locally

Install Git and **Node.js 24 LTS** (including npm), then:

```sh
git clone https://github.com/elikennedy/scoundrel.git
cd scoundrel
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. No environment variables, API keys, database or artwork-generation tools are needed.

Choose **Enter the dungeon**, then open the question-mark control for rules and practice. Hover over a card or focus it with Tab to reveal its actions. Enter or Space activates a focused button. The guide closes with Return to game or Escape; a finished run closes with Play again.

Use the **Settings** cog beside New game to adjust effects and music, mute either channel, or mute all. Background music begins after a game or audio interaction. Settings are saved in this browser.

## High scores

After a run, optionally enter three letters and choose **Save score**. The ten highest scores are kept in this browser, including negative scores; earlier completion times break ties. Dates display in your local timezone. Clearing site data removes scores, and different browsers or site addresses have separate tables.

Cloud scores are not implemented. Leave `VITE_CLOUD_STORAGE_ENABLED` at its default `false`; enabling it shows an unavailable message. See [storage architecture](docs/architecture.md#high-score-lifecycle) for the extension point.

## Develop and build

| Command | Purpose |
| --- | --- |
| `npm ci` | Install locked dependencies |
| `npm run dev` | Start the development server |
| `npm test` | Type-check and run engine and score-storage tests |
| `npm run lint` | Run Oxlint |
| `npm run build` | Type-check and create the static site in `dist/` |
| `npm run preview` | Preview the build locally, normally on port 4173 |

To change the game, start with the [architecture and validation guide](docs/architecture.md). Rules live in pure TypeScript under `src/game/`; React rendering and animation are separate. Run tests, lint, build and `git diff --check` before submitting changes. There is no saved-game system or deployment automation.

To publish your own copy, follow the [self-hosting guide](docs/hosting.md). Only the built `dist/` directory needs to be served.

## Explore the project

- [Rules and interpretations](docs/rules.md): how this adaptation plays.
- [Documentation index](docs/README.md): development, design and artwork references.
- [Artwork and prompts](docs/art/README.md): AI-generated sources and selected exports.
- [Product scope](PRODUCT.md) and [design system](DESIGN.md): constraints for future changes.

## Credits and license

Scoundrel was created by Zach Gage and Kurt Bieg. Read their [original rules](https://www.stfj.net/art/2011/Scoundrel.pdf).

This repository's original application, engine implementation and artwork are offered under the [MIT License](LICENSE), subject to the scope in [NOTICE](NOTICE). The original Scoundrel rules, rulebook and other third-party materials are excluded from that grant. This is not an official release by the game's creators.

Optional house rules are available from the bronze Settings cog: handicap 1–4 adds random high-value red cards; Jokers in adds two tricksters that can exchange with a discarded card. Settings apply to the next new game. House-rule runs show a final score and are excluded from high scores. See [rules](docs/rules.md) and [art prompts](docs/art/house-rules-generation.json).
