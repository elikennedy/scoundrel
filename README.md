# Scoundrel

A single-player browser adaptation of the dungeon-crawling card game by Zach Gage and Kurt Bieg. Built with React, TypeScript and Vite; the rules engine is independent of React.

The desktop game is playable with all 44 illustrated cards, weapons, healing, fleeing and scoring. It includes animated dealing, a face-up discard fan, bronze controls, illustrated outcome dialogs and a full-screen How to Play guide with rules, tactics and a practice room. Open the question-mark control for instructions.

Keyboard interaction and reduced motion are supported. Mobile layouts are outside the current scope. Games run entirely in the browser: there is no backend, account system or saved-game persistence. Refreshing the page loses the current game.

## Clone and run locally

Install Git and **Node.js 24 LTS**, including npm. Check your installation with `node --version` and `npm --version`. Access to this private GitHub repository is required; authenticate with GitHub before cloning.

```sh
git clone https://github.com/elikennedy/scoundrel.git
cd scoundrel
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Stop the server with Ctrl+C. No environment variables, API keys, database, external services or artwork generation tools are required. All runtime artwork is included in the repository.

## Build and validate

```sh
npm test
npm run lint
npm run build
npm run preview
```

Open the preview URL printed in the terminal, normally `http://localhost:4173`, and check the start screen, dealing, card actions and How to Play guide.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the exact dependency versions in the lockfile |
| `npm run dev` | Start the development server |
| `npm test` | Strict engine/test type-checking and rule/simulation tests |
| `npm run lint` | Static checks with Oxlint |
| `npm run build` | Type-check and build production assets into `dist/` |
| `npm run preview` | Preview the production build locally |

Builds require development dependencies, so do not use `npm ci --omit=dev` on the build machine. `dist/` is generated and ignored by Git. Vite's development and preview servers are for development and local checks; use a static web server for production. See [Vite's deployment documentation](https://vite.dev/guide/static-deploy.html).

## Self-host

Build on your workstation or a build server, then upload **the contents of `dist/`** to a static web server's document root. Include the entire directory tree, including `assets/` and `art/`. Node.js is needed to build, but is not needed on the web server serving the finished files. The repository, `node_modules/` and retained artwork originals in `docs/` do not need to be published.

Serve the app at the root of a domain or subdomain, such as `https://scoundrel.example.com/`. Artwork currently uses root-relative `/art/...` URLs; hosting under a path such as `/scoundrel/` requires code changes as well as Vite's base-path setting. Open the game over HTTP or HTTPS rather than opening `dist/index.html` directly from disk.

### Example: Nginx on your own server

This example assumes Nginx is already installed on a Linux server and you have permission to configure it. Replace `scoundrel.example.com` with your hostname and point that hostname's DNS record at the server. Allow inbound traffic on the port you serve.

On the server, create the document root:

```sh
sudo mkdir -p /var/www/scoundrel
```

Copy the contents of the built `dist/` directory into `/var/www/scoundrel/` using your normal deployment or file-transfer tool. The resulting paths should include `/var/www/scoundrel/index.html`, `/var/www/scoundrel/assets/` and `/var/www/scoundrel/art/`. Ensure the Nginx worker can read these files and traverse their directories.

Add this server block to Nginx's loaded configuration. On installations that include `/etc/nginx/conf.d/*.conf` inside the `http` block, save it as `/etc/nginx/conf.d/scoundrel.conf`:

```nginx
server {
    listen 80;
    server_name scoundrel.example.com;
    root /var/www/scoundrel;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }
}
```

Check the configuration and reload Nginx:

```sh
sudo nginx -t
sudo systemctl reload nginx
```

Open `http://scoundrel.example.com/`. This example serves HTTP; for HTTPS, configure a certificate for your hostname in Nginx or put it behind your existing HTTPS reverse proxy. No application API or WebSocket proxy is required. There are no client-side routes that need an HTML fallback.

### Updates and troubleshooting

To build a new version from a clean checkout:

```sh
git pull --ff-only origin main
npm ci
npm test
npm run lint
npm run build
```

Deploy the new `dist/` contents together, ideally by uploading into a new release directory and switching the web root once the upload finishes. Keep the previous release if you need a quick rollback. Players must refresh to load an update, which starts a new game.

- **Clone denied:** confirm your GitHub account has repository access and your Git credentials are configured. SSH users can clone `git@github.com:elikennedy/scoundrel.git` instead.
- **Install or build fails:** check Node.js is version 24, install development dependencies with `npm ci`, and retain the committed lockfile.
- **Blank page or missing artwork:** check the browser's network panel for failed requests. Confirm you deployed everything in `dist/` at the domain root, rather than publishing a nested `dist/` folder or only `index.html`.
- **Old UI after deployment:** refresh the browser and invalidate any proxy/CDN cache. Avoid long-lived caching of `index.html` and `/art/` files, whose names can remain unchanged between releases. Files in `assets/` have build-generated hashes.

## Documentation and source

- [Documentation map](docs/README.md): ownership and retention policy.
- [Rules and interpretations](docs/rules.md): the game contract and credited original source.
- [Architecture and validation](docs/architecture.md): engine API, animation lifecycle and UI checks.
- [PRODUCT.md](PRODUCT.md): product scope and open decisions.
- [DESIGN.md](DESIGN.md): visual and motion contract; `.impeccable/design.json` extends it.
- [Artwork index](docs/art/README.md): runtime/source assets, prompts and archived variants.
- [Guide research](docs/guide/research.md): sources, limitations and worked examples.

`src/game/` contains the pure TypeScript rules engine; `tests/game.test.ts` validates it. `src/App.tsx` coordinates the table and dialogs. `src/components/` contains cards, status, piles, motion and How to Play. Artwork mappings are in `src/components/cardIllustrations.ts`; runtime art is under `public/art/` and retained originals under `docs/art/`.

No deployment automation or saved-game system is currently implemented.

## License and game credits

The original React application, TypeScript game-engine implementation, and original card and interface artwork created for this repository are available under the [MIT License](LICENSE). See [NOTICE](NOTICE) for the license scope and third-party exclusions.

**The Scoundrel game rules are not owned by this repository and are not covered by its MIT license.** Scoundrel was created by Zach Gage and Kurt Bieg. The [original rules](https://www.stfj.net/art/2011/Scoundrel.pdf) and their rulebook text remain separate from this application's implementation; this repository grants no rights to those materials. References to or summaries of the rules do not relicense the original game or rulebook.

Third-party dependencies and supplied reference material retain their respective rights and licenses.
