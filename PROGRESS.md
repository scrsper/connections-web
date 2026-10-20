# Bad Tengu progress

## 2026-10-19 — sourced research atlas

Built a new editorial homepage and `/timeline/` explorer with search, topic/evidence filters, profiles, focused SVG connections, shortest indexed paths, meeting lists, citations, coverage notes and JSON download. Preserved the original map at `/network/`, including old query-link compatibility.

Research records are in `research/`, compiled by `scripts/build-atlas.mjs`. Scope includes Bilderberg annual lists for 2007–2019 and 2022–2026, steering roles, the published partial Dialog list, selected dinners and invitations, Epstein public proceedings and institutional reviews, and historical/finance/intelligence/AI/political records beginning in 1600. Earlier unofficial lists, complete private meals, all AI companies and the full Epstein corpus are not asserted as reviewed.

Review corrections: source search scopes independently of query; graph refocus clears a stale name query; event-only profiles expose related timeline events rather than navigating to unrelated nodes; profiles have an accessible dialog title; verified name variants consolidated; Jeff/Jeffrey Epstein remain separate; the Palo Alto dinner uses the Epstein topic because Dialog sponsorship is unestablished.

Cloudflare's previous workflow failed on zone-route authentication. Publishing now uploads and deploys the exact Worker version without changing existing domain routing. Wrangler updated from 4.120.1 to 4.151.2; dependency audit reports zero vulnerabilities.

Validation: reference/ID/evidence/roster checks, legacy graph validation and Cloudflare dry run pass. Browser checks cover all seven topics, source search for Goodwin within Epstein records, a sourced Thiel–dinner–Epstein path, accessible profile, 128-row 2026 roster, desktop and 390px mobile layout; no page-level horizontal overflow or console errors observed.

Deployment state: pending final release.
