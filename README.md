# Scoundrel

An illustrated, single-player browser adaptation of the dungeon-crawling card game by **Zach Gage and Kurt Bieg**. Survive the standard 44-card dungeon by choosing when to fight, equip weapons, heal, or flee.

This is an independent, vibe-coded hobby project, made for fun and entertainment only with React, TypeScript and Vite. It includes a How to Play guide with an interactive practice room, animated card movement, and local high score boards. See the credits below for the game, audio, generated artwork and code.

Desktop browsers only. Keyboard controls and reduced motion are supported. The game runs entirely in your browser without an account or backend. Refreshing starts over; high scores, audio preferences and house-rule settings persist.

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

## Optional house rules

The bronze **Settings** cog includes these options alongside audio controls. All default off, can be combined, and apply to the next new game. Changing settings does not alter a run already in progress.

| Setting | Effect |
| --- | --- |
| Handicap 1–4 | Add that many distinct hearts/diamonds valued 11–14, selected randomly from eight cards |
| Jokers in | Add two jokers that can be discarded or exchanged for a random discarded card |
| Cosmic cards in | Add Hand of Fate, Forge of Destiny, Devil’s Sight and Mirror of Misfortune |
| Barricades in | Add 1–4 each of Wooden Barricade, Rubble, Poisoned Thorns and Pit Trap, with independent counts |
| First Blood | First health loss starts permanent bleeding: act within 5 seconds or lose 1 HP per second afterward; healing does not cure it |

Cosmic cards can reshape the room, reset weapon restrictions or reveal the dungeon. Obstacles cost health or weapon power; Pit Traps allow only the health-cost action. A fully expanded deck has at most 70 cards. The in-game **House rules** chapter illustrates every option; [the rules reference](docs/rules.md#optional-house-rules) records their exact effects and edge cases.

Runs with every option off use the **Original rules** high score board. Any combination of house rules uses the separate **House rules** board.

## High scores

After any run, optionally enter three letters and choose **Save score**. The run’s starting rules select its board; changing Settings during play does not move it. Use the **Original rules** and **House rules** controls in High scores to view either board. Existing scores remain on Original rules. Each board keeps its own ten highest scores in this browser, including negative scores; earlier completion times break ties. Dates display in your local timezone. Clearing site data removes scores, and different browsers or site addresses have separate tables.

Cloud scores are not implemented. Leave `VITE_CLOUD_STORAGE_ENABLED` at its default `false`; enabling it shows an unavailable message. See [storage architecture](docs/architecture.md#high-score-lifecycle) for the extension point.

## Develop and build

| Command | Purpose |
| --- | --- |
| `npm ci` | Install locked dependencies |
| `npm run dev` | Start the development server |
| `npm test` | Type-check and run rules, storage, preferences and media tests |
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

- **Sounds:** sourced from [OpenGameArt.org](https://opengameart.org/), with credit to their respective creators.
- **Artwork:** all art assets were created through image generation with OpenAI. Retained originals and exact prompts are documented in the [artwork index](docs/art/README.md).
- **Code:** produced using **GPT-6.1 Sol** in the **Codex coding harness**.

The repository owner simply supplied some ideas for house rules for fun. They make no claim to having created the original game, code, artwork or sounds, and make no special claims of ownership. This is a vibe-coded hobby project for entertainment only, not an official release or endorsement by the game's creators or the credited contributors.

The repository is shared under the [MIT License](LICENSE), subject to the scope in [NOTICE](NOTICE). The original Scoundrel rules, rulebook and other third-party materials are excluded from that grant and retain their respective rights and licenses.
