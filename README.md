# Connections

Cloudflare Worker project for the interactive founder and entity relationship map.

## Deploy

    npm install
    npx wrangler login
    npm run deploy

The Worker is named connections and is published at `https://badtengu.com`.
The account-level `workers.dev` address and Worker preview URLs are disabled so
the custom domain is the only public route maintained by this configuration.

Cloudflare Workers Builds should use:

    Build command: (leave empty)
    Deploy command: npm run deploy
    Root directory: /

GitHub Actions also validates the Wrangler configuration on every push and
pull request before future changes reach production.
