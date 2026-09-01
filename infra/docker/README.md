# GrideX cloud Docker stack

## English

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

---

## Български

Този stack дефинира частната backend граница зад публичния статичен портал.

- OpenRemote Manager управлява живите Assets, телеметрията, правилата и MQTT API.
- OpenRemote Keycloak предоставя OIDC вход.
- PostgreSQL образът на OpenRemote остава отделен за поддържания OpenRemote stack.
- Отделен официален PostgreSQL контейнер съхранява търговските и workflow данните на GrideX.
- GrideX API валидира Keycloak токените и е единствената услуга с достъп до GrideX базата.

Копирайте `.env.example` като частен `.env` на сървъра и заменете всички примерни тайни. Файлът не трябва да се commit-ва. Порт 5432 умишлено не се публикува. API първоначално слуша само на localhost порт 8088 и трябва да бъде маршрутизиран през production TLS proxy като `https://api.gridex.tech`, преди порталът да премине в live режим.

OpenRemote Manager вече предоставя MQTT broker/API. Edge Gateway устройствата използват MQTTS на порт 8883 с ограничен Keycloak service user, затова за първата инсталация не е необходим отделен Mosquitto broker.
