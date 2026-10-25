# Self-hosting Scoundrel

Build requirements and local setup are in the [README](../README.md). From the project directory:

```sh
npm ci
npm run build
npm run preview
```

Check the preview before uploading.

Build on your workstation or a build server, then upload **the contents of `dist/`** to a static web server's document root. Include the entire directory tree, including `assets/` and `art/`. Node.js is needed to build, but is not needed on the web server serving the finished files. The repository, `node_modules/` and retained artwork originals in `docs/` do not need to be published.

Serve the app at the root of a domain or subdomain, such as `https://scoundrel.example.com/`. Artwork currently uses root-relative `/art/...` URLs; hosting under a path such as `/scoundrel/` requires code changes as well as Vite's base-path setting. Open the game over HTTP or HTTPS rather than opening `dist/index.html` directly from disk.

## Example: Nginx on your own server

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

## Updates and troubleshooting

To build a new version from a clean checkout:

```sh
git pull --ff-only origin main
npm ci
npm test
npm run lint
npm run build
```

Deploy the new `dist/` contents together, ideally by uploading into a new release directory and switching the web root once the upload finishes. Keep the previous release if you need a quick rollback. Players must refresh to load an update, which starts a new game.

- **Install or build fails:** check Node.js is version 24, install development dependencies with `npm ci`, and retain the committed lockfile.
- **Blank page or missing artwork:** check the browser's network panel for failed requests. Confirm you deployed everything in `dist/` at the domain root, rather than publishing a nested `dist/` folder or only `index.html`.
- **Old UI after deployment:** refresh the browser and invalidate any proxy/CDN cache. Avoid long-lived caching of `index.html` and `/art/` files, whose names can remain unchanged between releases. Files in `assets/` have build-generated hashes.

