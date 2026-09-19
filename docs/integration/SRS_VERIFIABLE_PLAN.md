# GrideX specification comparison and acceptance plan

Repository / GitHub: `antouanbg/gridex-energy-os`

## Scope and evidence / Обхват и доказателства

Review date: 2026-09-19. Source: owner-supplied
`Gridex_SmartgridOne_Specification.docx`, version 1.0, 12 rendered pages.
All 32 numbered subsections plus the unnumbered commissioning workflow in
chapter 12 are mapped below: **33 comparison items**. This is an implementation
plan, not approval to operate equipment, expose networks or change menus.
The source is a proposal, not proof of Eniris or GrideX capabilities.

Дата: 2026-09-19. Източник: предоставената спецификация, версия 1.0, 12 страници.
Съпоставени са всички 32 номерирани подраздела и процесът в глава 12:
**33 позиции**. Това е план, не разрешение за управление на оборудване,
отваряне на мрежи или промени в менюто. Спецификацията не доказва налични функции.

Evidence baseline is local source inspection, not a fresh audit of remote main
or a runtime/hardware test. Dirty changes are preserved and explicitly marked.
Източници са локалният код и записаните проверки, не нова проверка на remote main
или живите устройства. Непубликуваните промени са запазени и означени.

| Ref | Repository and inspected revision / Хранилище и ревизия | Evidence / Доказателство |
| --- | --- | --- |
| F | gridex-energy-os, `107cde1984f2f45918c49da20835cbd660e3f49e` | `app/page.tsx`, `app/lib/gridex-auth.ts`, `tests/e2e/`, HANDOFF. UI/auth tests are recorded history, not rerun here / записани предишни тестове, не повторени сега. |
| B | gridex-openremote-backend, `1ba529d1f4459ce90662474d0b1bbcaca9b6805c` plus dirty worktree / с непубликувани промени | `services/gridex-api/src/`, migrations, tests, HANDOFF, CODEX_STATE. |
| E | gridex-edge-gateway, `d9657a3201165618ac80a1a2f99b0332ec048932` plus modified HANDOFF | `base-rockpie/`, `node-esp32-evb/`, `src/SafetyEnvelope.cpp`, CODEX_STATE. Earlier physical OTA/heartbeat evidence is historical / предишните OTA/heartbeat проверки не са текущо здраве. |

Evidence keys used below / Ключове за доказателствата:

- B1: `services/gridex-api/src/auth.mjs`, `invitations.mjs`, `mailgun.mjs`, `repository.mjs`; tests `membership-access.test.mjs`, `invitations.test.mjs`.
- B2: `services/gridex-api/src/device-setup.mjs`, `device-vault.mjs`; tests `device-setup.test.mjs`, `device-vault.test.mjs`; HANDOFF imported test pair.
- B3: **uncommitted** `services/gridex-api/src/edge-config.mjs`, migration `006_edge_config_jobs.sql` and related modified integration files. Only polling adapter, not equipment drivers / **непубликувано**, само polling адаптер, не драйвери за оборудване.
- B4: `services/mqtt/mosquitto.conf`: TLS certificates required, identity-based usernames, ACL, persistence, configured connection/message limits. This is broker configuration, not measured scale / конфигурация, не измерен капацитет.
- B5: `services/gridex-api/src/strategy-config.mjs`, `economics.mjs`; strategy validation and economics are not an executing optimizer / валидация, не изпълняващ оптимизатор.
- B6: `deploy/wireguard/compose.prepared.yml`, `hub.conf.example`, `site-router.conf.example`; prepared templates, not active tunnel evidence / шаблони, не доказан активен тунел.
- E1: `base-rockpie/src/NodeTcpPollingService.cpp`, `MqttHealthPublisher.cpp`, corresponding tests; `node-esp32-evb/src/MbusNode.cpp`.
- E2: `base-rockpie/src/TelemetryJournal.cpp`, `tests/test_telemetry_journal.cpp`; bounded rotating journal, not proven seven-day acknowledged recovery / ограничен ротационен журнал, не доказано седемдневно възстановяване.
- E3: `base-rockpie/src/OtaApply.cpp`, `node-esp32-evb/src/EspOtaService.cpp`, `ProvisioningLine.hpp`; historical OTA tests / исторически OTA проверки.
- E4: `src/SafetyEnvelope.cpp`, `base-rockpie/systemd/gridex-rockpie.service`, `tests/test_main.cpp`; safety code/service restart do not prove full watchdog or actuator acceptance / код и рестарт не доказват пълна хардуерна защита.

## Status rules / Правила за статус

**P** = partial evidence, full requirement unaccepted / частично, не е прието цялото изискване.
**U** = not demonstrated in inspected baseline / недоказано в прегледаната база,
not a claim that no other branch contains work / не твърдение, че няма работа в друг клон.
**W** = uncommitted implementation / непубликувана реализация.
**R** = source requirement needs reconciliation / изисква корекция на спецификацията.
No item is DONE based only on a filename, screen, configuration, mock or old log.
Няма DONE само по файл, екран, конфигурация, mock или стар лог.

## Point by point comparison / Сравнение точка по точка

Each row gives source ID, present evidence, missing work and a pass/fail gate.
Всяка позиция съдържа ID, налично доказателство, остатъчна работа и приемателен тест.

| SRS | Current / Налично | Work and acceptance / Работа и приемане |
| --- | --- | --- |
| 1.1 Scope / Обхват | P: F+B+E cover portal/backend/edge, not platform parity / портал/backend/edge, не пълна еквивалентност. | G0: approve MVP vs later scope; every requirement has owner, test and release / одобрени MVP/бъдещи функции, отговорник, тест и издание. |
| 1.2 Autonomous edge / Автономност | P: E1/E4 local polling/safety; no complete autonomous optimization proof / локално четене/защита, не цял оптимизатор. | G5: disconnect cloud in simulator, preserve validated local limits, reject expired commands / прекъсване на облака, запазени лимити, отказ на стари команди. |
| 1.3 Business model / Бизнес модел | P/U: B1 membership; reseller hierarchy, white-label, billing and compliance unaccepted / членство, останалото неприето. | G7: separately specify delegation, branding, entitlements and compliance evidence; test cross-tenant denial / отделни договори и тест за отказ между организации. |
| 2.1 Edge/cloud split / Разделение | P: E1+B5; no measured subsecond closed loop / няма измерен бърз затворен контур. | G0/G5: document latency budget and ownership; measure full sensor-to-command path, not loop timer / бюджет и измерване на целия път, не само таймер. |
| 2.2 Components / Компоненти | P/R: F, B4, E1; Kafka/TSDB/VPP not established by this review / не са установени като готова система. | G0: inventory real services/dependencies; choose extra infrastructure only from load/storage measurements / реален инвентар; нови услуги само след измервания. |
| 2.3 Sampling/aggregation / Четене/агрегация | P: E1/E2; 200 ms and 15-minute semantics unproven / времената и агрегациите недоказани. | G1/G3: contract units, sign, timestamps, quality, sequence; test missing/out-of-order samples and energy integration / единици, знак, време, качество; тест на липси, ред и енергия. |
| 3.1 Hardware tiers / Хардуерни версии | U: ROCK Pi/ESP pilot, not Light/Pro/Ultra products / пилот, не продуктови серии. | G7: BOM and port/isolation/capacity matrix per actual model; bench evidence before catalogue claims / BOM и матрица с физически проверки. |
| 3.2 CPU/storage / Процесор/памет | P/R: Linux/ESP baseline and E2, no endurance/power-loss qualification / няма квалификация за износване/спиране на ток. | G3/G7: measure CPU/RAM/disk writes; qualify storage, atomic writes and controlled power-loss recovery on test hardware / измервания и безопасни лабораторни тестове; filesystem name alone is not proof / име на файлова система не е доказателство. |
| 3.3 Diagnostics LEDs / LED диагностика | U: telemetry states exist; complete physical LED map not verified / няма пълна проверена LED карта. | G1/G7: map available pins/LEDs, test boot/link/offline/error without actuator writes / карта и тестове без команди към товари. |
| 4.1 Modbus/SunSpec | P/R: E1 driver interface; no universal discovery proof / интерфейс за драйвери, не универсално откриване. | G1/G5: exact model/firmware register maps; read-only bounded scan; SunSpec bases 0/40000/50000, scaling/endian/invalid-value fixtures / точни карти, ограничено сканиране, тестове на данните. |
| 4.2 FIMER/ABB | U: no accepted driver evidence / няма доказан приет драйвер. | G7: verify each model/protocol/port against manufacturer; read/write capability tested separately / проверка по производител; четене и управление отделно. |
| 4.3 OCPP | U/R: no accepted local OCPP service / няма приета услуга. | G7: charger compatibility/security profile; simulator BootNotification and bounded charging-profile tests; no assumed fixed port or automatic serial discovery / договор, симулатор, без универсален порт/серийно откриване. |
| 4.4 Relays / Релета | U: no authorization for live relays / няма разрешение за реално превключване. | G5/G7: interlocks, manual override, minimum on/off times, safe startup; simulator first, qualified commissioning later / блокировки, ръчен режим, времена, симулация преди приемане. |
| 5.1 Peak shaving | P: B5 strategy code, E4 limits; not deployed closed loop / настройки и лимити, не внедрен контур. | G5: load-step simulations with SOC/device constraints and configurable priorities; quantify overshoot / симулации и измерен overshoot, не фиксиран приоритет за всички обекти. |
| 5.2 Self-consumption / Собствено потребление | P: B5 selector only evidence / наличен избор, не доказан алгоритъм. | G5: signed power convention, BMS/SOC limits, forecast errors and unavailable loads; verify no limit breach / знак, лимити и липсващи товари; без нарушения. |
| 5.3 Phase imbalance / Фазов дисбаланс | U: no proven per-phase actuation / няма доказано управление по фази. | G5/G7: first per-phase telemetry; permit control only on verified capable inverter / първо телеметрия; управление само при доказана поддръжка. |
| 5.4 Curtailment / Ограничаване | P/R: B5 zero_export label is not zero-export proof / име на стратегия не е доказателство. | G5: feedback loop, measurement loss, latency, ramp limits and tolerated export defined/tested; remove absolute 0 W guarantee / затворен контур и допустими отклонения, без абсолютна гаранция. |
| 5.5 Battery-assisted hubs / Зарядни хъбове | U: no commissioned hub / няма приет хъб. | G7 after G5: power/energy sizing, coordinated EV/BESS simulator and site electrical approval / оразмеряване, симулация и електротехническо приемане. |
| 6.1 VPP | U: multi-site inventory is not VPP dispatch / инвентарът не е VPP. | G7: aggregation contract, available capacity, consent, dispatch isolation; two-site simulation and audit / договор, капацитет, съгласие, изолация и одит. |
| 6.2 Markets / Пазари | P/R: B5 and day-ahead backlog, no accepted TSO integration / няма приета TSO интеграция. | G6/G7: separate day-ahead from balancing products; validate provider/market-specific timings and qualification, never assume universal 4 s / отделяне на пазарите и проверка на конкретните изисквания. |
| 6.3 Forecasting / Прогнози | P/U: B5 config fields, no measured forecast service / настройки, не измерена услуга. | G6: simple baseline before ML, holdout error metrics, data age and missing-weather fallback / базов модел, независима оценка, възраст и липсващи данни. |
| 7.1 Connectivity / Свързаност | P/R: B6 and ROCK-initiated design; no direct ESP cloud path / архитектура без директен ESP-cloud път. | G0/G4: retain Site Router VPN boundary, local pilot exception explicit, separate public browser ingress from device transport; no Eniris host / разграничаване на публичен вход и транспорт, без чужди адреси. |
| 7.2 Offline cache / Офлайн журнал | P: E2 rotation; recovery worker/seven days unproven / ротация, не доказан worker/седем дни. | G3: sizing, durable IDs/cursor/ACK, deduplication, live/backfill fairness, full disk/reboot tests and explicit overflow alarm / капацитет, ACK, без дублиране, пълен диск и аларма за загуба. |
| 7.3 mTLS/security / mTLS/сигурност | P: B4 mTLS configuration; PKI lifecycle and penetration acceptance pending / lifecycle и приемане предстоят. | G4: wrong/expired/revoked cert and cross-site topics denied; renew/rotate keys; threat model and independent security review / отрицателни тестове, ротация и независим преглед. |
| 8.1 Tokens / Токени | P/R: F+B1 Keycloak PKCE, not custom password login / Keycloak, не собствен password login. | G4: retain OIDC, test refresh/logout/expiry/revocation; define separate scoped machine access / OIDC тестове и отделен ограничен машинен достъп. |
| 8.2 API | P/R: B1/B2 existing API, proposed /v1 routes not approved replacements / примерните пътища не заменят текущите. | G0/G4: map actual /api/v1 contract in OpenAPI; pagination, validation, RBAC, rate limits, errors and idempotency tests / OpenAPI и договорни тестове. |
| 9.1 Installer portal / Портал | P: F+B2 site/device UI; not every live page integrated / не всички раздели са свързани. | G1/G2: real owner sees imported pair; denied user cannot retrieve configuration; empty/offline/error cases distinct / реални устройства, отказ и отделни състояния. |
| 9.2 Mobile / Мобилен клиент | P: F responsive web, not native applications / responsive сайт, не native приложения. | G1/G6: physical mobile login/navigation, stale data and chart checks; native apps separate scope / физически телефон, остарели данни, графики; native отделно. |
| 10.1 Roles / Роли | P: B1 site membership, no validated full DAG / членство, не пълен DAG. | G4/G7: explicit view/control/manage grants, revoke propagation, no implicit parent access; cross-tenant negative tests / явни права, отнемане, без неявно наследяване. |
| 10.2 Licensing / Лицензиране | U/R: no accepted engine / няма приет engine. | G7: signed entitlements, offline grace/clock rollback tests; safety functions never disabled by expiry / подписани права, offline/часовник; защитите не спират при изтичане. |
| 11.1 Fail-safe | P: E4; full device-specific fallback unproven / пълното поведение недоказано. | G5: site-approved safe state for lost meter/cloud/BMS, stale commands and restart; measured transitions, not generic 60 s / одобрени безопасни състояния и измерени преходи. |
| 11.2 Watchdogs | P: E4 restart policy, not full hardware watchdog proof / restart policy, не пълен watchdog. | G5: process hang, RS485/Ethernet failure, bounded retries/reboot storm prevention; simulated then controlled bench test / зависване, комуникационни грешки и ограничено възстановяване. |
| 12 Commissioning / Приемане | P/W: B2 imported pair, E3 historical OTA, B3 unfinished activation / импорт, стар OTA тест, незавършена активация. | G2: secure claim/ownership transfer, admin approval, ROCK pull, ESP readback, matching revision and health; reject replay/wrong site/unsupported adapter / защитено присвояване и пълен тест на активацията. |

## Execution gates / Етапи за изпълнение

Every gate is **OPEN**. Order is dependencies, not permission to enable hardware.
Всички етапи са **OPEN**. Редът е по зависимости, не разрешение за хардуерни действия.

| Gate | Owner area / Отговорна част | Dependencies / Зависимости | Required deliverable and pass criterion / Резултат и приемане |
| --- | --- | --- | --- |
| G0 | Architecture / Архитектура | none / няма | Approved GrideX-specific SRS and actual API/service map; resolve R items; reconcile branches without losing WIP / одобрена спецификация, договори и запазен WIP. |
| G1 | Edge + backend + frontend | G0 | Read-only ESP → ROCK → backend → owner UI trace with sample ID/time/quality; disconnect/reconnect produces correct states, not fake zero; proposed 24 h soak with results recorded / проследима телеметрия, прекъсване/възстановяване и предложен 24 ч тест. |
| G2 | Edge + backend + frontend | G0, G1 for health proof / за здраве | Finish/review B3 without overwriting unrelated work. Test real PostgreSQL migration/rollback, stale revision, duplicate ACK, crash between apply/ACK, wrong identity and rollback. No active badge before matching readback/health / миграция, грешки, повторения и доказано прилагане. |
| G3 | Edge + backend | G1 | Versioned export/ACK worker; disk quota and measured seven-day capacity; interrupted/repeated recovery preserves logical records; backup/restore with agreed RPO/RTO / worker, капацитет, повторно възстановяване и договорени RPO/RTO. |
| G4 | Security + backend | G0; before any wider exposure / преди разширяване на достъпа | Real owner and second-site negative tests, PKI rotation/revocation, MQTT ACL, secret backup; VPN activated only after separate owner approval / реални права, ключове, ACL; VPN само след отделно одобрение. |
| G5 | Edge/control | G1, G2, G3, G4 | Simulator-first safety/command lifecycle: priority arbitration, TTL, replay, limits, manual override, startup/loss fallback, signed OTA/rollback policy. Hardware acceptance separately authorised / първо симулатор, после отделно одобрен хардуер. |
| G6 | Backend + frontend | G3, G5 for dispatch / за управление | Day-ahead preview including purchase/sale fees, efficiency, cycle wear, SOC/power constraints and missing-price handling; reproducible profit/energy accounting; no dispatch until approved / възпроизводима симулация без неразрешено управление. |
| G7 | Product/integrations | relevant earlier gates / съответните предходни етапи | Separate scoped projects for hardware tiers, OCPP, DSO/VPP, ML, reseller hierarchy, licensing and white-label; each requires vendor/operator evidence and tests / отделни проекти с доказателства. |
| DOC-01 | Documentation / Документация | G0, then each accepted feature / после приетите функции | Docusaurus proposal and Eniris-inspired docs hierarchy remain in HANDOFF; publish only accepted behaviour, label planned features / документирай само приетото като готово. |

## Acceptance evidence record / Запис на приемането

For every SRS ID record: responsible person, repository/PR/commit, deployment
revision, test name, environment (mock/simulator/bench/live), UTC execution time,
expected/actual result, sanitised evidence link, reviewer, rollback, remaining
blocker and next action. A CI pass does not replace a required hardware/browser
acceptance test. Store private logs outside public Git and reference a redacted
result. Record failures too. Record N/A only with an explicit scope decision.

За всяко SRS ID: отговорник, repo/PR/commit, deployment ревизия, тест, среда
(mock/симулатор/стенд/реална), UTC време, очакван/получен резултат, обезличено
доказателство, проверяващ, rollback, пречка и следваща стъпка. CI не замества
хардуерен/браузърен тест. Частните логове са извън публичния Git. Записват се и
неуспехите. N/A изисква изрично решение за обхвата.

Baseline counters: 33 mapped, 0 fully accepted against this SRS, 33 open;
8 execution gates G0–G7 open plus DOC-01. Existing completed component work is
preserved as evidence, not erased by these full-requirement counters. Do not
publish a completion percentage from partial evidence.

Начален отчет: 33 съпоставени, 0 изцяло приети по тази SRS, 33 отворени;
8 отворени етапа G0–G7 и DOC-01. Вече направените компоненти остават доказателства;
това не означава, че работата започва от нула. Без процент готовност от частични данни.

## Corrections required before implementation / Корекции преди реализация

- Preserve Keycloak authorization-code/PKCE, single private backend configuration,
  max two roles/device, ROCK-initiated provisioning and ESP via ROCK. Replace vendor
  hosts/branding; no physical battery commands in this planning task.
- Do not treat MQTT/TLS as HTTPS merely because both can use TCP 443; explicitly
  choose transport/proxy routing. No direct public OT exposure; VPN templates are
  not an active or tested tunnel.
- Pin manufacturer-specific register maps and safe bounds. SunSpec discovery is
  not proof of write support. Fix base addresses and address-offset conventions.
- Define tolerances rather than promise perfect 0 W export; do not use license
  expiry to disable protective control. Validate regulatory/market claims with
  competent review before describing compliance or market readiness.
- Quantify retention, latency, resource limits and storage endurance; distinguish
  instantaneous power averages from integrated energy and billing settlement.
- Claiming ownership must not automatically enable cloud actuation. Require
  commissioning, authorization and explicit approval independently.

- Запазваме Keycloak/PKCE, единната частна backend конфигурация, до две роли на
  устройство, provisioning от ROCK и ESP през ROCK. Премахваме чуждите адреси/марки.
  Планирането не включва команди към батерията.
- MQTT/TLS не става HTTPS заради порт 443; транспортът/proxy се описват изрично.
  Без публична OT мрежа; VPN шаблоните не доказват активен тунел.
- Точни производителски карти/граници. SunSpec откриване не доказва управление;
  коригират се базови адреси и offset конвенции.
- Допустими отклонения вместо гаранция за 0 W; лицензът не изключва защитите.
  Регулаторни/пазарни твърдения изискват компетентна проверка преди заявяване.
- Измерими срокове, латентност, ресурси и износване; разграничаване на средна
  мощност, интегрирана енергия и сетълмент.
- Присвояване на собственост не активира автоматично управление от облака;
  приемането, правата и одобрението са отделни условия.

Primary technical references / Първични технически източници:
[OAuth security BCP](https://www.rfc-editor.org/rfc/rfc9700.html),
[SunSpec device information model](https://sunspec.org/wp-content/uploads/2009/03/SunSpec-Device-Information-Model-Specificiation-V1-2-1.pdf).

Validation of this plan: complete source section coverage, bilingual row review,
evidence-path existence and `git diff --check`. No runtime tests rerun, migrations
applied, devices scanned, services restarted or hardware commands sent.

Проверка на плана: покритие на разделите, двуезичен преглед, налични evidence
файлове и `git diff --check`. Без нови runtime тестове, миграции, сканиране,
рестарти или хардуерни команди.
