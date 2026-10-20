# Bilderberg and Dialog evidence handoff

Research checked 19 October 2026. Dataset: `research-bilderberg-dialogue.json`.

## Delivered

- 34 sources, 1,341 entities, 25 events, and 2,678 relationships.
- 2,347 annual Bilderberg roster rows spanning every meeting in 2007–2019 and 2022–2026. The official overview says 2020 and 2021 were cancelled.
- 1,009 annual rows come directly from organizer-hosted pages (2017–2019, 2022–2026).
- 1,338 annual rows come from archived reproductions (2007–2016), explicitly labeled secondary provenance and `reported` evidence.
- All 32 entries in the current official steering-committee page, and 199 historical leadership role rows.
- All 63 names in the partial Dialog 2022 roster published with an invitation by Andrew Gelman. These are announced participants, not independently confirmed attendees.

Events and relationships have topic `Bilderberg & Dialog`, except the separate 2015 Palo Alto dinner and its participation edges, categorized under `Epstein records`. Every meeting is also an entity. People connect to meetings or dated reports; co-attendance is not converted into person-to-person relationships.

## Critical distinctions

The correct organizational spelling is **Dialog**. Bilderberg annual participants are not automatically governing-committee members. The former steering list has 199 rows but 194 people because some held multiple roles. Relationship IDs preserve these roles. The 2015 archived participant list repeats Henri de Castries as chairman and in the alphabetical roster: 134 rows, 133 people. Every roster supplies `count`, `uniquePeopleCount`, and original names.

The 2007–2009 scans were downloaded, rendered and visually inspected. All names and separately listed rapporteurs were transcribed; professional biographies were not transcribed. The 2008 scan prints only “Kwasniewski,” with no given name: that ambiguity is retained. Historical royal titles remain distinct from current monarchs. The 2010 archive index labels its list official, but the individual page solicits an original copy; the dataset therefore treats it as an attributed secondary transcription.

The publicly reproduced House Oversight invitation was forwarded by Ian Osborne on **28 November 2012**. It was addressed to Osborne, explicitly non-transferable, and described a March 2014 retreat. Its attachment described a partial list of anticipated **2013** participants. It does not show that Jeffrey Epstein was invited, belonged to Dialog, or attended the retreat.

**Jeff Epstein, former Oracle CFO, is a different person from Jeffrey Epstein.** WIRED corrected an initial conflation. The dataset keeps them separate.

The 2015 Palo Alto dinner has its own event. Published reporting supports the dinner connection, but the reviewed evidence does not establish formal sponsorship by Dialog. It does not establish knowledge of crimes by other guests.

WIRED's June 2026 report distinguishes a website directory from registrations for a planned retreat. The Powerscourt venue booking was subsequently cancelled. Registrations and directory references are not labeled actual attendance. This dataset does not collect private leaked contact fields, affiliations volunteered in private, credentials, or raw leaked databases.

## Scope bounds

The earlier historical archive labels pre-2007 annual lists unofficial and 1958 incomplete. Those annual rosters were excluded. The official history still supplies the first meeting in May 1954 and the official former-leadership page supplies earlier governance connections.

There is no exhaustive claim about all Dialog members, every retreat attendee, or every dinner/lunch. No meal-by-meal record was found that could support such a claim. The dataset states these gaps.

Name variants were merged only where identity and matching historical affiliation supported it. Original names remain in each roster's `listedName`, and person entities include aliases. Peter A. Thiel is merged into Peter Thiel. George A. David and George M. David remain distinct because the proposed identity match was not established.

## Validation

Final validation found no duplicate relationship IDs, no missing relationship endpoints, no missing event entity references, and no missing cited source IDs. Repeated roster people are checked as role rows rather than blindly discarded.

Sources particularly useful for review:

- [Official Bilderberg FAQ](https://www.bilderbergmeetings.org/frequently-asked-questions)
- [Official participant roster for 2026](https://www.bilderbergmeetings.org/meetings/meeting-2026/participants-2026)
- [Official steering committee](https://www.bilderbergmeetings.org/background/steering-committee/steering-committee)
- [Official former leadership](https://www.bilderbergmeetings.org/background/steering-committee/former-steering-committee-members)
- [Historical archive with provenance labels](https://publicintelligence.net/bilderberg/)
- [Gelman's published Dialog invitation](https://statmodeling.stat.columbia.edu/2022/02/16/hey-i-got-an-exclusive-invitation-to-this-off-the-record-conference-but-i-think-ill-take-1907-jamaican-beef-patties-instead/)
- [House Oversight invitation mirror](https://epstein.media/files/house_oversight_013484/)
- [WIRED's Dialog reporting and correction](https://www.wired.com/story/leak-exposes-members-of-peter-thiels-secretive-dialog-society/)
- [Powerscourt cancellation reporting](https://www.vanityfair.com/story/peter-thiels-secret-society-got-booted-from-an-irish-estate)
