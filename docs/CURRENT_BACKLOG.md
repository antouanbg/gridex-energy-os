# Current delivery backlog / Актуални оставащи задачи

Updated: 2026-09-20. Repositories: antouanbg/gridex-energy-os (UI),
antouanbg/gridex-openremote-backend (API), antouanbg/gridex-edge-gateway (edge).
This is a documentation reconciliation, not a fresh infrastructure/runtime audit.
Newest HANDOFF evidence supersedes historical unfinished checklists.

## English

### I18N-01 — Ten-language localisation (planned, not implemented)

Owner requested recording the proposed work. Proposed stack: i18next/react-i18next,
versioned JSON catalogues in Git, Weblate for translation review/Git integration.
No service installation or translation-provider purchase is authorised by this entry.

- [ ] Extract all inline BG/EN strings into keyed catalogues, split by module;
      English is canonical, retain BG coverage and existing URLs/session behaviour.
- [ ] Confirm the full ten-language list. Known candidates: EN, BG, FR, ES, DE, IT;
      four additional languages remain an owner decision. Do not invent them.
- [ ] Prepare initial machine/AI translations of static product text only, reviewed
      against an EMS terminology glossary. Never send customer data or credentials.
- [ ] Add direct in-app selection, English fallback, on-demand catalogues and
      locale-aware dates/numbers; preserve physical units and currency semantics.
- [ ] Remember explicit choice locally and, when signed in, in the profile.
- [ ] Add optional IP-country suggestion with a privacy-reviewed provider or local
      database. A VPN indicates exit country, not nationality/language. Never override
      explicit selection; on lookup failure use browser preference. Do not block login.
- [ ] Localise Keycloak login/recovery and invitation/support email templates too.
- [ ] CI: missing keys, placeholders/plurals, BG/EN parity, long labels, mobile
      overflow, locale switching and session preservation. Review all ten locales.

Acceptance: each approved language switches the real UI (not browser instructions),
survives refresh, has no missing-key output, and preserves device IDs/values/rights.
IP-FR test suggests French only without a prior explicit choice. Current behaviour
remains browser-language BG/EN plus optional translation instructions; no IP lookup.

### Consolidated next work

1. **P1 — Real Devices acceptance:** heartbeat ingestion/API implemented and previously
   physically verified; confirm owner UI and controlled stale/offline/reconnect/reboot
   behaviour. Do not report heartbeat as unimplemented or as continuously monitored.
2. **P1 — ROCK sensor telemetry:** CPU temperature and selectable metric profile,
   edge payload → MQTT → storage/API → Devices; actual readings, no demo substitutes.
3. **P1 — Configuration/OTA lifecycle:** reconcile existing code before completion;
   prove draft → approval → ROCK-initiated retrieval → apply/readback → active or
   failure/rollback, including ESP via ROCK. Firmware and config have separate gates.
4. **P1 — Remaining live screens:** inventory missing API contracts per page and wire
   actual scoped data; keep honest unavailable/setup-required states, never demo fallback.
5. **P2 — I18N-01:** ten-language pipeline above; final language list/provider decisions.
6. **P2 — Access-management acceptance:** reconcile older invitation backlog with
   completed Mailgun/registration work; verify resend/revoke, organisation roles,
   Site grants and audit with separate users. Do not rebuild working email delivery.
7. **P2 — Documentation portal:** proposed Docusaurus on doc.gridex.tech, EN/BG,
   Eniris-inspired structure; platform/repo confirmation then public sanitised guides.
8. **P2 — Day-ahead arbitrage:** versioned strategy, cycle cost/losses/fees and limits,
   forecast vs realised profit; simulation/read-only first, no implicit BESS enablement.
9. **Pre-production gates:** selectable per-Site WireGuard/private or direct mTLS,
   external/reconnect/certificate-renewal tests; tested backup/restore including keys;
   SRS gap-by-gap evidence. Existing LAN mTLS pilot is not full dual-mode acceptance.
10. **Acceptance/regression:** real-account multi-tab/logout/mobile resume/offline
    session tests, latest mobile banner confirmation. Keep tests on each release.

Completed frontend baseline: stable section URLs, session restoration/hardening,
separate public demo, submenu breadcrumbs, three-tile swipe navigation (owner
accepted), redundant demo controls removed and mobile banner Sign in restored.
Last published UI PR #39, main 8d948286671469ef5798a568541ef224c8cde97b.

## Български

### I18N-01 — Десет езика (планирано, още не е реализирано)

Предложение: i18next/react-i18next, JSON преводи в Git и Weblate за редакция/одобрение.
Записването на задачата не разрешава инсталации или покупка на преводаческа услуга.

- [ ] Изнасяне на всички BG/EN текстове в каталози по модули; EN е основен език.
- [ ] Потвърждаване на десетте езика: EN, BG, FR, ES, DE, IT са кандидати;
      останалите четири се избират от собственика, не се предполагат.
- [ ] Машинен/AI начален превод само на статични продуктови текстове, с проверка
      по EMS речник; без клиентски данни, пароли или токени.
- [ ] Реален избор в сайта, fallback на английски, зареждане само на нужните
      каталози, форматиране на числа/дати без промяна на мерни единици/валута.
- [ ] Запомняне в браузъра и в профила след вход.
- [ ] Предложение по IP чрез оценен за поверителност доставчик/локална база.
      VPN показва изходна държава, не националност/език. Ръчният избор има приоритет;
      при неуспешна IP проверка ползваме браузъра, без блокиране на входа.
- [ ] Превод на Keycloak вход/възстановяване и имейли с покани/поддръжка.
- [ ] CI за липсващи ключове, параметри/множествено число, дълги текстове,
      мобилни екрани и запазване на сесията; преглед на всичките десет езика.

Приемане: реален превод при избор и след refresh, без липсващи ключове или промяна
на ID/стойности/права. IP от Франция предлага френски само без запомнен ръчен избор.
Сега остава BG/EN по браузър с инструкции за превод; IP разпознаване няма.

### Оставащ списък

1. **P1 — Приемане на Устройства:** heartbeat вече е внедрен/получаван; остава
   реален owner UI тест и контролирани offline/reconnect/reboot проверки.
2. **P1 — Сензори на ROCK:** температура и избираеми метрики по целия MQTT/API/UI път.
3. **P1 — Конфигурации/OTA:** сверяване на наличния код и довършване/доказване на
   чернова → одобрение → изтегляне от ROCK → прилагане/readback → активна/грешка/rollback;
   ESP само през ROCK, отделни проверки за firmware и конфигурация.
4. **P1 — Останалите live екрани:** списък на липсващите API договори и реални
   данни по права; без демо заместители след вход.
5. **P2 — I18N-01:** десетте езика по горния план; избор на четирите останали/доставчик.
6. **P2 — Управление на достъпа:** сверяване на стария план с работещите Mailgun/
   регистрация; resend/revoke, роли, права по Обекти и audit с отделни потребители.
7. **P2 — Документация:** предложение Docusaurus на doc.gridex.tech, EN/BG,
   структура по Eniris; потвърждение на платформа/репо, после публични безопасни ръководства.
8. **P2 — Арбитраж ден напред:** стратегия с цикли/загуби/такси/ограничения и
   прогнозна срещу реална печалба; първо симулация, без активиране на BESS управление.
9. **Преди production:** двата транспорта по Обект, външни/сертификатни/reconnect
   проверки, backup/restore с ключовете и доказателства по SRS. LAN mTLS пилотът
   не е завършен тест на двата режима.
10. **Приемане/регресии:** реален multi-tab/logout/mobile resume/offline тест на
    сесиите и приемане на последния мобилен банер; тестове при всяка публикация.

Готов frontend: URL за раздели, сесии, отделно демо, подменюта/път, прието
плъзгащо меню, премахнати излишни демо контроли и видим мобилен Вход.
Последна UI публикация: PR #39, main 8d948286671469ef5798a568541ef224c8cde97b.
Това е сверка на документацията, не нов runtime одит на инфраструктурата.
