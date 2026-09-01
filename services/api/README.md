# GrideX API

Private HTTPS API between the static GrideX portal, PostgreSQL and OpenRemote.
It validates Keycloak access tokens and never exposes database or OpenRemote
service credentials to the browser.

The initial endpoints are:

- `GET /health` — process health
- `GET /ready` — PostgreSQL and OpenRemote connectivity
- `GET /api/v1/me` — authenticated identity
- `GET /api/v1/sites` — sites visible to the authenticated organisation user

Live telemetry and control endpoints are added behind the same API boundary as
the OpenRemote asset mapping is provisioned.
