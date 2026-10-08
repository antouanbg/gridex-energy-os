# Live audit correction / Корекция след живата проверка

Repository / GitHub: `antouanbg/gridex-energy-os`

Source: owner-provided external read-only audit, 2026-10-07 (BG/EN,
1024 × 900 and 390 × 844, three authenticated roles). Live commit was not
established by that audit. Owner authorised correction on 2026-10-08 against
the existing approved reference, not a new design or permission model.
Reference: gridex-docs `static/approved/users-three-roles.html`, revision
`eddd22552b6452e182d6fb9e3946c01657ac1f93`.

| Evidence | Approved requirement / component | Regression acceptance |
| --- | --- | --- |
| F01 | ServiceCatalog: separated label, detail, status, actions; approved five-service order | BG/EN desktop/mobile, no overlapping text, independent stop/request controls |
| F02 | LiveSites: visible labelled inputs on mobile | Borders, vertical gaps, keyboard focus, no overflow; no real Site created |
| F03 | Demo overview: responsive layout | 1024 and 390 widths without document overflow |
| F04 | Public reference: explicit UTF-8 document | Browser characterSet UTF-8 and readable Cyrillic; docs repository fix |
| F05 | Profile/sidebar: verified membership role, platform permission first | Each of six known roles; unknown is not promoted or invented |
| F06 | Denied Users: own identity only and link to personal Services | Viewer has no Users menu; no member data requested/displayed |
| Users reference drift | Invitations/OrganisationMembers/OrganisationAccess: title, self marker, own services, selected administrator | Three role-specific screens, populated/empty/error states, five-column register and mobile cards |
| F07 | OpenRemote Site detail empty | Read-only investigation required; do not add grants or fabricated attributes |

Source verification: TypeScript and lint pass (four pre-existing image warnings);
25 browser tests pass, including every demo route at 390/1024/1440 in BG/EN,
role-specific Users/denied screens, mobile Site fields and public privacy.
Backend: 149 passing tests, one skipped; organisation display name is returned
only through the existing subject/active-organisation/realm-scoped membership.
BG/EN documentation consistency, typecheck and isolated build pass.

Read-only live probe: novacom has 2 members, 5 catalogue entries, 2 approved
organisation services; member Site links verified; foreign-realm and viewer
administration rejected. This does not exercise authenticated browser writes.
F07: the existing ThingAsset has four text metadata attributes (internal IDs,
resource kind and notes), a null location and no measurement attributes.
None are marked accessRestrictedRead. No attribute visibility was broadened.
A real restricted-user response is still needed to establish the exact Manager
rendering cause; do not call it fixed or create duplicate resources.

Publication: frontend PR #109; backend PR #100 merged as e90c1b6, API restart
awaits explicit owner approval. Docs PR #53 merged as 23a120b and deployed with
deploy-local.sh; local proxy BG/EN and CSS/JS MIME checks pass. Browser verified
UTF-8 Cyrillic in the canonical reference. External VPN acceptance remains open.
Docs dependency audit reports 47 findings (15 moderate, 16 high, 16 critical)
in the build toolchain; no blind upgrades applied. Track separately from UI fixes.
Frontend render/API unit checks: 29 passed after adding the documentation helper
to the test loader. Full browser suite remains the release gate; older tests
must use canonical membership roles, not generic Administrator/Customer labels.
Full local run: 93/94 passed with four workers; the stalled-login retry test
failed once and passed unchanged in isolation (2.3s). Record as intermittent,
not a proven production authentication defect or a silently skipped check.

Status: frontend source corrections under final CI, not yet deployed. No rights, inventory or mail
changed. Fixture tests are not real-account acceptance. After publication the
external three-role test must be repeated, including separately authorised
reversible write tests. Preserve original audit privately, not in public help.

БГ: собственикът разреши поправка по одобрените макети, без нова логика.
Таблицата свързва всеки докладван дефект с компонент и приемателна проверка.
Кодът, публикацията и приемането с реалните акаунти са отделни състояния.
Празният панел в OpenRemote изисква доказана причина, не добавяне на права
или измислени атрибути. Реални записи/имейли не са част от тестовите данни.
