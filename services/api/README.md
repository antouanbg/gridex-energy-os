# GrideX API

## English

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

---

## Български

Частен HTTPS API между статичния GrideX портал, PostgreSQL и OpenRemote. Той валидира Keycloak access token-и и никога не предоставя на браузъра идентификационни данни за базата или OpenRemote service account.

Начални endpoint-и:

- `GET /health` — състояние на процеса;
- `GET /ready` — свързаност с PostgreSQL и OpenRemote;
- `GET /api/v1/me` — идентичност на удостоверения потребител;
- `GET /api/v1/sites` — обекти, достъпни за организацията на потребителя.

Live телеметрията и управляващите endpoint-и ще бъдат добавени зад същата API граница след provisioning на OpenRemote Asset mapping-а.
