# GrideX Energy OS — Working Rules

## Mandatory auth regression gate / Задължителна auth проверка

After proxy, Keycloak, OIDC, frontend login changes or restart: verify local
master discovery, admin console authServerUrl and a fresh login form all stay
on the configured local admin origin; verify public gridex issuer/callbacks
remain public, and master/admin/health/metrics stay blocked at public ingress.
Run backend scripts/check-auth-routing.mjs with the single private backend env.
Normal-DNS trusted-TLS probes and forced local/LAN probes are different evidence;
never claim external reachability from a local probe. Read the actual router
destination port before testing; do not assume host port 443.
HTTP 200 for a shell/form is NOT completed login. Require browser login,
logout and fresh login after session expiry before declaring authentication
accepted. Record untested steps, failures, rollback and deployment revision in
HANDOFF. Never weaken CORS/TLS or expose master to repair login. Do not print
passwords, tokens or session/action URLs. This gate is not a running monitor.

След proxy, Keycloak, OIDC, frontend login промени или рестарт: провери local
master discovery, authServerUrl на admin конзолата и нова login форма — всички
към конфигурирания локален admin адрес. Public gridex issuer/callbacks остават
публични, а master/admin/health/metrics — забранени на публичния ingress.
Изпълни backend scripts/check-auth-routing.mjs с единния частен backend env.
Normal-DNS/trusted-TLS и принудителните local/LAN проби са различни доказателства;
локален успех не доказва външен достъп. Чети реалния целеви порт на рутера,
не приемай host 443. HTTP 200 на shell/форма НЕ е завършен вход. Изисквай browser
вход, изход и нов вход след изтекла сесия преди приемане. Записвай непроверените
стъпки, грешки, rollback и deployment ревизия в HANDOFF. Не отслабвай CORS/TLS
и не излагай master за поправка. Без пароли, токени и session/action URL в логове.
Това е проверка при промени, не работещ постоянен монитор.

## Active host decision / Активен host

Owner decision 2026-09-14: active staging is Linux ARM64 under macOS/Colima.
Windows deployment statements below are historical. Keep Site Router VPN
boundaries unchanged; local login testing does not authorize public exposure.

Решение 2026-09-14: активният staging е Linux ARM64 под macOS/Colima.
Windows deployment текстовете по-долу са исторически. Site Router VPN
границите се запазват; local login тест не разрешава публично излагане.

## EMS architecture — mandatory

This repository is part of a distributed EMS based on OpenRemote and custom
site gateways. The central backend runs on **Windows 11** and hosts Docker
services, OpenRemote, the GrideX API, PostgreSQL, monitoring and logging.

Every physical site has its own dedicated **Site Router**. WireGuard terminates
only on the Windows backend and on that router. ROCK Pi, ESP/OLIMEX nodes,
inverters, BESS, meters and EV chargers are behind the Site Router; they do
not run WireGuard. Each site has an independent peer, key pair, configuration
and isolated control/telemetry networks. Site-to-site routing is prohibited by
default.

Normal path: `Windows backend ↔ WireGuard ↔ Site Router ↔ site devices`.

Never commit real addresses, VPN ranges, private keys, passwords, tokens,
customer inventories or deployment domains. Use placeholders and `.env.example`
files. Do not expose OT/BESS networks directly, and do not reintroduce public
MQTT port 8883 after the VPN-only migration.

Vendor-specific Modbus/CAN/RS mappings belong in drivers and mappings, never
in generic EMS logic. Commands to physical devices must be limited, logged,
validated and fail safe. Use the manufacturer protocol as authoritative.

## Menu structure — owner approval required / Структура на менюто — само с разрешение

- Do not change menu structure, grouping, order, labels, hierarchy, visibility
  or navigation destinations without the project owner's explicit permission.
  This applies to desktop, mobile, account menus and submenus.
- Add a new menu item only when explicitly requested by the owner. Do not infer
  permission from a new feature, endpoint, design task or general cleanup.
- When a menu change seems necessary, describe the affected items and proposed
  change and obtain approval before implementation. Limit any approval to the
  requested change; preserve the rest of the navigation.
- Не променяй структурата, групирането, реда, имената, йерархията, видимостта
  или целевите екрани на менюто без изрично разрешение от собственика.
  Правилото важи за desktop, mobile, потребителско меню и подменюта.
- Добавяй нов елемент само по изрично искане на собственика. Нова функция,
  endpoint, дизайн задача или общо почистване НЕ означава разрешение.
- Ако промяна е необходима, опиши засегнатите елементи и предложението и
  получи одобрение преди изпълнение. Одобрението важи само за поисканата
  промяна; останалата навигация се запазва.

## Mobile layout approval / Одобрение за мобилното оформление

Before changing any mobile layout, responsive CSS, mobile navigation, font size,
touch target, or mobile-only component behavior:

1. Describe the observed issue to the project owner.
2. Identify the affected screen(s) and the proposed change.
3. Ask for explicit approval before editing, committing, or deploying the change.

Do not publish mobile frontend changes merely because an automated test or a
desktop emulation appears to pass. A user-reported mobile issue is authoritative.

## General safeguards

- Before publishing login or live dashboard changes, render a successfully
  authenticated Site with no battery and null SOC/SOH, in both languages.
  HTTP 200/auth token success does not prove the post-login UI works.
- Преди публикация на login/live табло тествай успешно удостоверен Обект без
  батерия и с null SOC/SOH на двата езика. HTTP 200/token успех не доказва,
  че екранът след вход работи.

- Preserve unrelated work and inspect `git status` before changes.
- Do not commit secrets, credentials, private keys, or production-only settings.
- Keep product documentation bilingual where practical: English first, Bulgarian second.
- Update tests and documentation with material implementation changes.

## Bilingual synchronisation — mandatory

For every user-facing, architecture, configuration, safety or operational text:

1. English is the canonical section and Bulgarian is the matching section.
2. Update both versions in the same commit whenever meaning changes.
3. Keep figures, data paths, units, defaults, roles and safety conditions
   semantically identical; wording may differ only for correct translation.
4. Use `docs/i18n/GLOSSARY.md` as the binding terminology source. Do not
   translate code identifiers, API fields, protocol names or product brands.
5. Before commit, inspect the changed EN/BG sections and fix discrepancies;
   never leave a stale translation for a later task.

## Task recovery and Git workflow

- Before declaring completion, test the exact requested flow, including populated,
  empty, denied and unavailable states. Record mocked versus real-user evidence,
  tested revision, results and publication verification. CI or a demo shell alone
  does not establish real-account acceptance.
- Keep unfinished work in HANDOFF with status, blocker, next action and acceptance
  criteria. On resuming, review it and propose the highest-priority unfinished
  step without waiting to be reminded; do not expand hardware/network authority.
- Преди приключване тествай точния поток: налични/липсващи данни, отказ и
  недостъпност. Записвай mock спрямо реален вход, ревизия, резултати и проверена
  публикация. CI или демо екран не доказва приемане с реален акаунт.
- Незавършеното остава в HANDOFF със статус, пречка, следващо действие и критерий
  за приемане. При подновяване предложи най-важната незавършена стъпка без
  подсещане; не разширявай разрешенията за хардуер и мрежа.

- Start every task by reading this file, `CODEX_STATE.md`, relevant docs and
  `git status`; the repository is authoritative over remembered conversation.
- Preserve unrelated user changes and use small, logical commits.
- Update `CODEX_STATE.md` after meaningful milestones with completed work,
  remaining work, tests, known issues and the exact next action.
- Whenever incomplete work needs a `HANDOFF.md`, identify the repository
  directly below its title as `Repository / GitHub: <owner>/<repository>`.
  This is mandatory so a handoff is never ambiguous across GrideX repos.
- Keep architecture diagrams and core documentation in English and Bulgarian.
- Before a commit inspect `git diff` and `git status` for accidental secrets.
