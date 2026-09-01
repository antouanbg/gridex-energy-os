# GrideX cloud Docker stack

This stack defines the private backend boundary for the public static portal.

- OpenRemote Manager owns live assets, telemetry, rules and its MQTT API.
- OpenRemote Keycloak provides OIDC login.
- The OpenRemote PostgreSQL image remains dedicated to the supported OpenRemote stack.
- A separate official PostgreSQL container stores GrideX commercial and workflow data.
- GrideX API validates Keycloak tokens and is the only service allowed to access the GrideX database.

Copy `.env.example` to a private `.env` on the server and replace every sample
secret. Never commit that file. Database port 5432 is deliberately not
published. The API is initially bound to localhost port 8088 and must be routed
through the production TLS proxy as `https://api.gridex.tech` before live mode
is enabled in the portal.

The OpenRemote Manager already provides the MQTT broker/API. Edge gateways use
MQTTS on port 8883 with a restricted Keycloak service user, so a second
Mosquitto broker is not required for the first deployment.
