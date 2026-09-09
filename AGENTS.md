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

## Task recovery and Git workflow

- Start every task by reading this file, `CODEX_STATE.md`, relevant docs and
  `git status`; the repository is authoritative over remembered conversation.
- Preserve unrelated user changes and use small, logical commits.
- Update `CODEX_STATE.md` after meaningful milestones with completed work,
  remaining work, tests, known issues and the exact next action.
- Keep architecture diagrams and core documentation in English and Bulgarian.
- Before a commit inspect `git diff` and `git status` for accidental secrets.
