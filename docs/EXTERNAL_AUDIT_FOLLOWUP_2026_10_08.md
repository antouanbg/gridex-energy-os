# External audit follow-up / Поправки по външния одит

Source: private Claude live audit, 2026-10-08 05:36–06:35 UTC, portal
86faec8, canonical gridex-docs 053f2aa. All 13 evidence images inspected.
No account, invitation, grant, inventory or measurement writes authorised by
the evidence. Owner requested fixes against existing approved templates.

| Finding | Cause / implementation | Acceptance |
| --- | --- | --- |
| D1 chart 403 | Site-scoped principal dropped verified platform service permission; backend retains it only for chart service checks after requireSite | authorised Site succeeds; absent Site/link/measurement never leaks data |
| D2 platform roster editor | shared org editor rendered for platform read-only view | View action, role/Sites as text, no grant controls; org editor unchanged |
| D3 market-zone layout | missing row styles | distinct bordered rows, >=44px targets, desktop/mobile |
| D4 Manager blank detail | proxy misses nested userRealmRoles and alarm GET; encoded spaces in fonts rejected | exact-realm gate, authenticated GET only, no master/admin or writes |
| D5 viewer overlap | inline anchor under wrapped paragraph | >=12px separation in BG/EN at390px |
| D6 terminology | stale Devices/Profile labels and English catalogue mismatch | Infrastructure/Services/current graph label |
| N1 Site cards | missing asset/service summary | uses verified hardware and same-organisation service grants; errors distinct from empty |

Owner explicitly confirmed: platform charts only for already-authorised Sites,
not all organisations. Existing OpenRemote Site/measurement checks remain.
D4 source route correction does not prove the full blank-detail cause resolved;
repeat external restricted-user test after an approved rollout.
Further D6 source corrections: BG/EN Overview/Profile/Plan help links, readable
telemetry values, identical-source deduplication with distinct sensors preserved,
and clarification of OpenRemote console assets (no deletion). All three reported
English Overview strings corrected. External acceptance remains open.
Current status: source corrections, full browser suite 95/95 passed, NOT deployed.

Verification: backend 154 passed / 1 skipped; frontend typecheck and production
build pass; lint has 0 errors and 4 existing image warnings. Site-chart browser
regression verifies both service denial and Site-access denial (no retained
measurements). The API client now preserves the safe error code for this route.
An initial local backend run failed to bind its test port under the sandbox;
the authorised local-only rerun passed. This was not a production failure.
The first browser suite found an obsolete Devices label in a test; the test
now uses the approved Infrastructure label, and the navigation retest passes.

БГ: прегледани са 13 снимки от живия одит. D1–D6 се следят поотделно;
поправен код не е външно приемане. Одобрението за супер админ е само за вече
достъпните Обекти. Няма промени по реални данни/права. N1 и останалите
преводи/телеметрия/помощ вече имат поправки в кода; външното им приемане е
отворено. D4 изисква реална повторна проверка.
