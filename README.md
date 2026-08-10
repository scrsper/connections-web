# Connections

Cloudflare Worker project for the interactive founder and entity relationship map.

## Deploy

    npm install
    npx wrangler login
    npm run deploy

The Worker is named connections and is configured to publish through the
Cloudflare account's public workers.dev subdomain.

Cloudflare Workers Builds should use:

    Build command: npm install
    Deploy command: npm run deploy
    Root directory: /
