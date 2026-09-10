# Current task

Prepare the versioned site configuration centre and PostgreSQL/OpenRemote API
contract for review.

# Completed

- Rebased the PV configuration work onto the merged lazy 19-section frontend.
- Added ten configuration scopes with required, conditional and read-only fields.
- Added PV orientation, mounting, tracking, 1P/2P, DC kWp, tilt, azimuth and inverter fields.
- Added typed draft/validate/simulate/activate frontend API methods.
- Added PostgreSQL-facing PV/configuration/outbox models and bilingual ownership documentation.
- Confirmed that frontend never writes OpenRemote directly.

# Remaining

- Review and merge the frontend and backend configuration Pull Requests.
- Implement the backend outbox worker/OpenRemote attribute mapper in a later runtime PR.

# Modified files

- `app/sections/settings.tsx`
- `app/globals.css`
- `app/lib/gridex-api.ts`
- `app/lib/gridex-contracts.ts`
- `db/schema.ts`
- `docs/integration/*`
- `tests/e2e/portal-sections.spec.ts`

# Tests

- `npm run lint` — no errors; two pre-existing image warnings.
- `npm test` — 10/10 pass.
- `npm run test:e2e` — existing 5/5 pass; the added configuration-centre test also passes.

# Known issues

- Activation is contract-ready; the backend outbox worker is intentionally a separate step.

# Next action

Commit, push and open the frontend configuration Pull Request.

# Last updated

2026-09-10
