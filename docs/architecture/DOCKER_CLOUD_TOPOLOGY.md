# GrideX backend and site VPN topology / GrideX backend и site VPN топология

## English

```text
Browser ── HTTPS ──> GrideX static frontend ── HTTPS/OIDC ──> Windows 11 backend
                                                              ├─ GrideX API
                                                              ├─ OpenRemote + Keycloak
                                                              ├─ PostgreSQL services
                                                              └─ WireGuard hub
                                                                     │
                                        per-site WireGuard peer ─────┼───── per-site WireGuard peer
                                                                     │
                                                              Site Router 01        Site Router 02
                                                              ├─ CONTROL LAN         ├─ CONTROL LAN
                                                              └─ TELEMETRY LAN       └─ TELEMETRY LAN
                                                                  └─ ROCK Pi / ESP / OT devices
```

The Windows 11 backend and each Site Router are the only WireGuard endpoints.
ROCK Pi, ESP/OLIMEX nodes and OT devices do not have WireGuard clients. Each
site has independent peer keys and configuration; sites cannot route to one
another. Modbus and MQTT traffic to a site uses the private tunnel through its
router. The OT/BESS LAN is never directly exposed to the backend or Internet.

Docker hosts OpenRemote, Keycloak, GrideX API and separate supported PostgreSQL
services. The browser receives only the API/OIDC endpoints and never receives
service credentials, MQTT credentials, device routes, VPN data or Modbus maps.
Public MQTT port 8883 is not part of the VPN-only architecture.

## Български

Windows 11 backend-ът и Site Router на всеки обект са единствените WireGuard
крайни точки. ROCK Pi, ESP/OLIMEX нодовете и OT устройствата не използват
WireGuard. Всеки обект има самостоятелен peer, ключове и конфигурация; няма
маршрутизация между обектите. Modbus и MQTT комуникацията преминава през
частния тунел и Site Router-а. OT/BESS мрежата не се публикува директно към
backend-а или интернет.

Docker услугите включват OpenRemote, Keycloak, GrideX API и отделни
PostgreSQL услуги. Браузърът получава единствено API/OIDC адресите — никога
service credentials, MQTT данни, маршрути до устройства, VPN данни или Modbus
карти. Public MQTT порт 8883 не е част от VPN-only архитектурата.
