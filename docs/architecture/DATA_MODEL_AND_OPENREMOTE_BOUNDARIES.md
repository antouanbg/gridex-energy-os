# GrideX data model and OpenRemote boundaries

## Purpose

The portal uses two complementary data stores. They must not duplicate control
authority or create two competing sources of truth.

- **OpenRemote** owns the live asset tree, current attribute state, telemetry
  datapoints, rules, predictions and desired/applied control values.
- **GrideX application storage** owns customer and commercial records, workflow
  state, versioned configuration requests, incident handling, notification
  preferences, tariff versions and the audit trail.
- **GrideX Edge** owns the local safety envelope, last-known validated BMS
  limits, heartbeat and fail-safe state. A cloud or portal write cannot bypass
  these protections.

## Core hierarchy

```text
Organisation
├── Users and roles (identity subject comes from Keycloak/OpenRemote OIDC)
├── Contracts and tariff versions
└── Sites
    ├── OpenRemote Site asset
    ├── Devices / OpenRemote child assets
    │   └── Metric points / OpenRemote attributes
    ├── Configuration revisions
    ├── Alarm rules
    ├── Incidents
    └── Integration connectors
```

The link between both systems is the immutable `openremoteAssetId` stored for
each site and device. A metric point links to an OpenRemote attribute name.

## Configuration synchronisation

```text
Frontend draft
  → GrideX API validation and permission check
  → configuration_revisions (requested revision)
  → OpenRemote asset/rule attribute write
  → OpenRemote event / applied state
  → configuration_revisions (applied or rejected)
  → frontend acknowledgement
```

The UI must display `Draft`, `Validated`, `Sent`, `Applied` or `Rejected`. An
HTTP acceptance alone is not shown as applied. The applied revision is only
confirmed after OpenRemote reports the resulting state.

## Telemetry

Telemetry is not copied into the GrideX application database. Device history
and comparison screens query OpenRemote datapoints through the GrideX API. This
keeps retention, time zones and attribute metadata consistent and avoids a
second time-series database.

## Alarm and incident lifecycle

1. A versioned alarm rule defines metric, operator, threshold, duration,
   cooldown, scope and delivery channels.
2. OpenRemote evaluates the live rule and opens an incident through the GrideX
   API.
3. Operators acknowledge and resolve the incident in GrideX.
4. Every transition records actor, timestamp and resolution note in the audit
   trail.
5. Notification preferences can be inherited from a role and overridden per
   user/event/channel.

## Tariff lifecycle

Tariffs are effective-dated. Editing an active tariff creates a new version;
past versions remain immutable so invoices, settlement and optimiser backtests
can always reproduce the price components used at that time.

The first relational implementation is defined in `db/schema.ts` and targets
open-source PostgreSQL. It is deployed with the private GrideX API backend,
never inside the public GitHub Pages frontend. Until that API is connected, the
public portal remains an illustrative frontend and OpenRemote integration
contract.
