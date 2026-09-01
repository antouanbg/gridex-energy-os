# GrideX Docker cloud topology

## Public and private boundaries

```text
Browser
  ├─ https://gridex.tech          GitHub Pages static frontend
  ├─ https://ems.gridex.tech/auth Keycloak OIDC login
  └─ https://api.gridex.tech      GrideX API (Bearer access token)

ROCK Pi E / Edge nodes
  └─ mqtts://ems.gridex.tech:8883 OpenRemote MQTT API

Private Docker network
  ├─ GrideX API
  │   ├─ GrideX PostgreSQL
  │   └─ OpenRemote HTTP API
  ├─ OpenRemote Manager / MQTT
  ├─ OpenRemote Keycloak
  └─ OpenRemote PostgreSQL
```

GitHub Pages serves only versioned HTML, CSS and JavaScript. It contains no
database credentials, OpenRemote service secret, MQTT credentials or server
logic. Login uses the OIDC Authorization Code flow with PKCE. The browser sends
the resulting short-lived access token only to the GrideX API.

## Why two PostgreSQL services

The OpenRemote stack is kept on its supported PostgreSQL image and lifecycle.
GrideX uses a separate official PostgreSQL container for organisations, sites,
configuration revisions, tariffs, incidents, notifications and audit records.
This prevents an OpenRemote upgrade from coupling its internal schema to the
GrideX business schema and allows independent backups and recovery.

## MQTT decision

OpenRemote Manager already functions as the MQTT broker/API and exposes MQTTS
on port 8883. The first deployment therefore does not add a second broker.
Every edge gateway receives a restricted service user and unique client ID.
Plain MQTT port 1883 is not exposed publicly.

## Production requirements

- expose only 80/443 and MQTTS 8883; never publish PostgreSQL 5432;
- route `api.gridex.tech` to the localhost-only GrideX API through TLS;
- allow CORS only from `https://gridex.tech` and `https://www.gridex.tech`;
- register those same origins and redirect URIs in the Keycloak public client;
- keep service-account credentials and database passwords outside Git;
- pin tested container versions instead of deploying moving `latest` tags;
- back up both PostgreSQL volumes independently and test restore procedures;
- keep Edge safety and heartbeat local even when every cloud service is down.
