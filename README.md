# Bad Tengu

Independent, source-led research atlas at https://badtengu.com, served by the existing Cloudflare Worker `connections`.

## Pages

- `/` — editorial home page.
- `/timeline/` — searchable timeline, connection explorer, profiles, published meeting lists, source library and coverage guide.
- `/network/` — preserved original 137-node / 190-edge map. Its legacy claims are labeled separately from the new research edition.
- `/data/atlas.json` — downloadable dataset with source references, dates, evidence statuses and limitations.

Existing root links containing `from`/`to` redirect to the original map with their query intact.

## Research

The checked-in files in `research/` are the source records. Run `npm run build:data` to combine them. Exact identity matching and reviewed aliases preserve the distinction between Jeff Epstein (former Oracle CFO) and Jeffrey Epstein.

The October 19, 2026 edition includes selected historical records beginning in 1600, Bilderberg lists, Dialog, Epstein proceedings and institutional investigations, asset management, private security, intelligence oversight, AI, TPUSA, Candace Owens, Charlie and Erika Kirk, and specific institutions connected with Israel, Ukraine and Russia.

Coverage is bounded. Annual participant lists are not permanent membership; archived reproductions are labeled; invitations and anticipated participants do not establish attendance. No exhaustive private-meal roll or criminal “client list” is claimed. Source references and qualification text belong to each claim and must survive future imports. Avoid unsourced identity merges and person-to-person edges inferred merely from co-attendance.

## Local work and validation

```sh
npm ci
npm run check
npm run dev -- --port 8787
```

`check` builds the data, validates references, unique IDs, roster rows, evidence statuses, identity separation and page/script syntax, preserves legacy feature checks, then runs a Cloudflare dry run. Browser QA should exercise source search under topic filters, profiles, graph refocus, traced paths, meeting lists and narrow-screen layout.

## Publishing

```sh
npx wrangler login
npm run check
npm run deploy
```

The deployment script uploads a version and deploys that exact returned version at 100%. It preserves the existing Custom Domain and does not rewrite zone routes. This avoids the old workflow's zone-route permission failure. It fails closed if the uploaded version ID is missing. Initial domain setup or deliberate routing changes still require `wrangler deploy`/trigger management with appropriate zone permissions.

GitHub Actions validates and deploys pushes to `main`, using the existing `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets. Never commit credentials. `workers.dev` and preview URLs remain disabled in the configuration. `npm run deploy` is also the deployment command for Workers Builds.

Progress and verified release state: [PROGRESS.md](PROGRESS.md).
