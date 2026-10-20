# Bad Tengu progress

## 2026-10-19 — sourced research atlas

Built a new editorial homepage and `/timeline/` explorer with search, topic/evidence filters, profiles, focused SVG connections, shortest indexed paths, meeting lists, citations, coverage notes and JSON download. Preserved the original map at `/network/`, including old query-link compatibility.

Research records are in `research/`, compiled by `scripts/build-atlas.mjs`. Scope includes Bilderberg annual lists for 2007–2019 and 2022–2026, steering roles, the published partial Dialog list, selected dinners and invitations, Epstein public proceedings and institutional reviews, and historical/finance/intelligence/AI/political records beginning in 1600. Earlier unofficial lists, complete private meals, all AI companies and the full Epstein corpus are not asserted as reviewed.

Review corrections: source search scopes independently of query; graph refocus clears a stale name query; event-only profiles expose related timeline events rather than navigating to unrelated nodes; profiles have an accessible dialog title; verified name variants consolidated; Jeff/Jeffrey Epstein remain separate; the Palo Alto dinner uses the Epstein topic because Dialog sponsorship is unestablished.

Cloudflare's previous workflow failed on zone-route authentication. Publishing now uploads and deploys the exact Worker version without changing existing domain routing. Wrangler updated from 4.120.1 to 4.151.2; dependency audit reports zero vulnerabilities.

Validation: reference/ID/evidence/roster checks, legacy graph validation and Cloudflare dry run pass. Browser checks cover all seven topics, source search for Goodwin within Epstein records, a sourced Thiel–dinner–Epstein path, accessible profile, 128-row 2026 roster, desktop and 390px mobile layout; no page-level horizontal overflow or console errors observed.

Deployment verified 2026-10-19 22:52 CT. Source commit `1719bae328da45c1e2a1dc4544ec23f3cf58579b` pushed to `main`; GitHub validation and deployment both succeeded. Cloudflare version `aab1f70a-a0e3-4670-b5a1-d0f3a64570d1` serves 100% of traffic. Home, timeline and original map return HTTP 200, and the live dataset exactly matches the checked-in file.

Release totals: 1,432 entities, 106 timeline records, 2,760 relationships, 101 sources and 21 published lists. The annual Bilderberg portion contains 2,347 list rows. Separate rows may represent the same person across years or roles.

## 2026-10-19 — cases and findings expansion

Added 30 case dossiers: 11 corporate/technology, 10 state/security and 9 Epstein-related institutional or court records. This adds 46 timeline records, 25 typed relationships, 56 sources and 17 entities. New totals: 1,449 entities, 152 timeline records, 2,785 relationships, 157 sources, 21 rosters and 30 cases.

The new `/timeline/?view=cases` view supports category, topic and text filters, stable individual case URLs, source documents, chronology, entity roles, findings, responses, outcomes and limits. Timeline records and profiles link into relevant cases. The homepage links to the collection. Categories describe dated actions, with later appeals, pardons, dismissals and no-admission terms kept visible. The dataset schema is version 2.

Research includes BlackRock SEC actions; NVIDIA disclosures; Ring, Alexa, Facebook, Xbox, Amazon Prime and Palantir cases; Google search litigation; CIA detention, MKULTRA, COINTELPRO, FBI detainee oversight, Iran-Contra, Blackwater/Academi, Wagner and GRU records; Maxwell, bank settlements, BOP/OIG, OPR, MIT and Harvard. Records remain bounded; no claim to catalogue every offense or infer culpability from social connections.

Review corrected two source locators and narrowed the Alexa remedy wording. The Academi dismissal remains expressly reported through a reproduced article because the court order was not retrieved. The JPMorgan judgment uses month precision; the MCC dismissal filing and prosecutor recommendation are distinguished. University-commissioned reviews are identified separately from government investigations.

Validation passed: all references, case fields and entity roles, original map checks and Cloudflare dry run. Browser QA passed for all six categories (2 convictions, 1 court finding, 6 regulatory actions, 10 civil settlements, 9 investigations, 2 allegation records), combined BlackRock/topic search, detailed Nisur and Google status qualifications, profile case links, MIT source search, homepage entry point and 390px list/detail layouts without page overflow. No console errors observed.
