# GrideX Energy OS — Working Rules

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
