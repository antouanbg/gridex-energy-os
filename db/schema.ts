import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

/**
 * GrideX keeps commercial/workflow records in D1. OpenRemote remains the
 * source of truth for live asset state and historical telemetry datapoints.
 */
export const organisations = sqliteTable("organisations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  legalName: text("legal_name"),
  registrationNumber: text("registration_number"),
  type: text("type").notNull().default("customer"),
  status: text("status").notNull().default("active"),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_organisations_registration_number").on(table.registrationNumber),
  index("idx_organisations_status_name").on(table.status, table.name),
]);

export const organisationUsers = sqliteTable("organisation_users", {
  id: text("id").primaryKey(),
  organisationId: text("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  identitySubject: text("identity_subject").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("viewer"),
  isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("active"),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_organisation_users_subject_org").on(table.identitySubject, table.organisationId),
  index("idx_organisation_users_org_status").on(table.organisationId, table.status),
]);

export const sites = sqliteTable("sites", {
  id: text("id").primaryKey(),
  organisationId: text("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  openremoteAssetId: text("openremote_asset_id").notNull(),
  name: text("name").notNull(),
  countryCode: text("country_code").notNull().default("BG"),
  timezone: text("timezone").notNull().default("Europe/Sofia"),
  marketCode: text("market_code").notNull().default("IBEX"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: text("status").notNull().default("commissioning"),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_sites_openremote_asset").on(table.openremoteAssetId),
  index("idx_sites_org_status").on(table.organisationId, table.status),
]);

export const devices = sqliteTable("devices", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  openremoteAssetId: text("openremote_asset_id").notNull(),
  externalId: text("external_id"),
  name: text("name").notNull(),
  assetType: text("asset_type").notNull(),
  manufacturer: text("manufacturer"),
  model: text("model"),
  protocol: text("protocol").notNull(),
  energyDirection: text("energy_direction").notNull().default("bidirectional"),
  connectionStatus: text("connection_status").notNull().default("unknown"),
  lastSeenAt: text("last_seen_at"),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_devices_openremote_asset").on(table.openremoteAssetId),
  uniqueIndex("idx_devices_site_external_id").on(table.siteId, table.externalId),
  index("idx_devices_site_status").on(table.siteId, table.connectionStatus),
]);

export const metricPoints = sqliteTable("metric_points", {
  id: text("id").primaryKey(),
  deviceId: text("device_id").notNull().references(() => devices.id, { onDelete: "cascade" }),
  openremoteAttribute: text("openremote_attribute").notNull(),
  name: text("name").notNull(),
  valueType: text("value_type").notNull().default("number"),
  unit: text("unit"),
  direction: text("direction").notNull().default("telemetry"),
  writable: integer("writable", { mode: "boolean" }).notNull().default(false),
  storeDatapoints: integer("store_datapoints", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_metric_points_device_attribute").on(table.deviceId, table.openremoteAttribute),
  index("idx_metric_points_device_direction").on(table.deviceId, table.direction),
]);

export const configurationRevisions = sqliteTable("configuration_revisions", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  revision: integer("revision").notNull(),
  scope: text("scope").notNull(),
  payloadJson: text("payload_json").notNull(),
  requestedBy: text("requested_by").notNull(),
  syncStatus: text("sync_status").notNull().default("draft"),
  validationMessage: text("validation_message"),
  openremoteEventId: text("openremote_event_id"),
  requestedAt: text("requested_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  appliedAt: text("applied_at"),
}, (table) => [
  uniqueIndex("idx_configuration_site_revision").on(table.siteId, table.revision),
  index("idx_configuration_site_status").on(table.siteId, table.syncStatus),
]);

export const alarmRules = sqliteTable("alarm_rules", {
  id: text("id").primaryKey(),
  siteId: text("site_id").references(() => sites.id, { onDelete: "cascade" }),
  metricPointId: text("metric_point_id").references(() => metricPoints.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  severity: text("severity").notNull(),
  operator: text("operator").notNull(),
  thresholdValue: real("threshold_value"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  cooldownSeconds: integer("cooldown_seconds").notNull().default(1800),
  scope: text("scope").notNull().default("site"),
  channelsJson: text("channels_json").notNull().default("[]"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [
  index("idx_alarm_rules_site_enabled").on(table.siteId, table.enabled),
  index("idx_alarm_rules_metric").on(table.metricPointId),
]);

export const incidents = sqliteTable("incidents", {
  id: text("id").primaryKey(),
  alarmRuleId: text("alarm_rule_id").references(() => alarmRules.id, { onDelete: "set null" }),
  siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  deviceId: text("device_id").references(() => devices.id, { onDelete: "set null" }),
  metricPointId: text("metric_point_id").references(() => metricPoints.id, { onDelete: "set null" }),
  severity: text("severity").notNull(),
  state: text("state").notNull().default("open"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  measuredValue: real("measured_value"),
  thresholdValue: real("threshold_value"),
  openedAt: text("opened_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  acknowledgedAt: text("acknowledged_at"),
  acknowledgedBy: text("acknowledged_by"),
  resolvedAt: text("resolved_at"),
  resolvedBy: text("resolved_by"),
  resolutionNote: text("resolution_note"),
}, (table) => [
  index("idx_incidents_site_state_opened").on(table.siteId, table.state, table.openedAt),
  index("idx_incidents_device_opened").on(table.deviceId, table.openedAt),
]);

export const notificationPreferences = sqliteTable("notification_preferences", {
  id: text("id").primaryKey(),
  organisationUserId: text("organisation_user_id").notNull().references(() => organisationUsers.id, { onDelete: "cascade" }),
  eventCode: text("event_code").notNull(),
  channel: text("channel").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  inherited: integer("inherited", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_notification_user_event_channel").on(table.organisationUserId, table.eventCode, table.channel),
]);

export const tariffVersions = sqliteTable("tariff_versions", {
  id: text("id").primaryKey(),
  organisationId: text("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  siteId: text("site_id").references(() => sites.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  version: integer("version").notNull(),
  currency: text("currency").notNull().default("BGN"),
  validFrom: text("valid_from").notNull(),
  validTo: text("valid_to"),
  status: text("status").notNull().default("draft"),
  changeReason: text("change_reason"),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_tariff_org_name_version").on(table.organisationId, table.name, table.version),
  index("idx_tariff_org_status_valid_from").on(table.organisationId, table.status, table.validFrom),
]);

export const tariffComponents = sqliteTable("tariff_components", {
  id: text("id").primaryKey(),
  tariffVersionId: text("tariff_version_id").notNull().references(() => tariffVersions.id, { onDelete: "cascade" }),
  componentType: text("component_type").notNull(),
  price: real("price").notNull(),
  unit: text("unit").notNull().default("BGN/MWh"),
  touWindow: text("tou_window"),
  daysJson: text("days_json"),
  seasonFrom: text("season_from"),
  seasonTo: text("season_to"),
  ...timestamps,
}, (table) => [
  index("idx_tariff_components_version_type").on(table.tariffVersionId, table.componentType),
]);

export const integrationConnectors = sqliteTable("integration_connectors", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  connectorType: text("connector_type").notNull(),
  displayName: text("display_name").notNull(),
  status: text("status").notNull().default("available"),
  capabilitiesJson: text("capabilities_json").notNull().default("[]"),
  configurationRef: text("configuration_ref"),
  lastHealthAt: text("last_health_at"),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_connectors_site_type").on(table.siteId, table.connectorType),
  index("idx_connectors_site_status").on(table.siteId, table.status),
]);

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  organisationId: text("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  siteId: text("site_id").references(() => sites.id, { onDelete: "set null" }),
  actorSubject: text("actor_subject").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id").notNull(),
  detailJson: text("detail_json").notNull().default("{}"),
  occurredAt: text("occurred_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_audit_org_occurred").on(table.organisationId, table.occurredAt),
  index("idx_audit_resource").on(table.resourceType, table.resourceId, table.occurredAt),
]);
