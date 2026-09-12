# GrideX Energy OS — Working Rules

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

## Mobile frontend approval

Before changing any mobile layout, responsive CSS, mobile navigation, font size,
touch target, or mobile-only component behavior:

1. Describe the observed issue to the project owner.
2. Identify the affected screen(s) and the proposed change.
3. Ask for explicit approval before editing, committing, or deploying the change.

Do not publish mobile frontend changes merely because an automated test or a
desktop emulation appears to pass. A user-reported mobile issue is authoritative.

## General safeguards

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

- Start every task by reading this file, `CODEX_STATE.md`, relevant docs and
  `git status`; the repository is authoritative over remembered conversation.
- Preserve unrelated user changes and use small, logical commits.
- Update `CODEX_STATE.md` after meaningful milestones with completed work,
  remaining work, tests, known issues and the exact next action.
- Whenever incomplete work needs a `HANDOFF.md`, identify the repository
  directly below its title as `Repository / GitHub: <owner>/<repository>`.
  This is mandatory so a handoff is never ambiguous across GrideX repos.
- Keep architecture diagrams and core documentation in English and Bulgarian.

## Mandatory Pull Request workflow / Задължителен Pull Request процес

- Every completed change set must be committed on a named branch, pushed to
  `origin` and given a Pull Request before it is reported as ready for review.
- The default target is `main`. Use a different base branch only when a
  documented dependency requires it, and state that dependency in the PR.
- Each PR must state its user-visible scope, tests, known limitations and any
  required deployment or manual verification steps.
- Never merge automatically. Report the Pull Request URL and wait for the
  project owner's review/merge decision.
- If a PR cannot be created, record its branch, commit SHA and exact blocker in
  `CODEX_STATE.md` and `HANDOFF.md` where applicable; never claim that a change
  is published to `main` before it is merged.

- Всяка завършена промяна се commit-ва в именуван branch, push-ва се към
  `origin` и получава Pull Request, преди да бъде докладвана като готова за
  review.
- Стандартната цел е `main`. Друга base branch се ползва само при документирана
  зависимост и тази зависимост се описва в PR-а.
- Всеки PR описва видимия за потребителя обхват, тестовете, известните
  ограничения и необходимите deployment или ръчни проверки.
- Не merge-вай автоматично. Докладвай Pull Request URL и изчакай review/merge
  решение на собственика на проекта.
- Ако PR не може да бъде създаден, запиши branch-а, commit SHA и точното
  препятствие в `CODEX_STATE.md` и при нужда в `HANDOFF.md`; никога не
  докладвай промяна като публикувана в `main` преди да бъде merge-ната.
- Before a commit inspect `git diff` and `git status` for accidental secrets.
