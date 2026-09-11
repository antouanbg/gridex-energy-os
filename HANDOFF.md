# Handoff — GrideX Energy OS portal

## Purpose

This file records concrete follow-up work that is intentionally **not yet
implemented or deployed**. It is durable project context; `CODEX_STATE.md`
remains the short-lived record of the active task.

## Pending work

1. **Merge and deploy the live Edge-health presentation**
   - Source: draft PR #13 (`feat/edge-health-status`).
   - Dependency: backend Edge-health ingestion must be deployed and its
     `/snapshot` response must contain `edge`.
   - Expected behaviour: Demo mode says “Demo Edge”; live mode never invents
     an online timestamp and shows unknown/degraded/offline/safe-mode data.

2. **Connect the portal to the commissioned backend**
   - Configure the production runtime settings outside Git: API base URL,
     OIDC issuer/client and default site ID.
   - Verify login, user permissions, site selection, `/health` and `/snapshot`
     against a non-demo environment. Do not embed tokens or deployment URLs.

3. **Complete component-level i18n**
   - The shell has keyed messages, but individual lazy-loaded sections still
     need a review for every English/Bulgarian label and technical term.
   - Apply the glossary in `docs/i18n/GLOSSARY.md`; retain EUR-only display.

4. **Run a real-device mobile acceptance pass before any layout changes**
   - The portal has automated viewport checks, but actual Android/iOS device
     screenshots are the acceptance evidence.
   - Per `AGENTS.md`, ask the project owner before changing any mobile layout,
     font size, navigation or touch behaviour.

5. **Enable backend-driven configuration forms incrementally**
   - PV, battery/PCS, metering, tariff, strategy, loads/EV and Edge devices
     need to read/write the versioned GrideX API configuration endpoints.
   - Do not connect forms directly to OpenRemote or PostgreSQL.

## Completion evidence

- Relevant draft PR merged after review.
- Browser tests pass and a real backend session validates authorization.
- No demo data appears for authenticated live data.
- No mobile change is deployed without explicit owner approval.

## Next action

Review PR #13 after the backend PR chain is accepted; then make a controlled
staging connection test using non-production credentials.
