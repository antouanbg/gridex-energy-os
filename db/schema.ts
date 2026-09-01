import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

/**
 * GrideX keeps commercial/workflow records in PostgreSQL. OpenRemote remains the
 * source of truth for live asset state and historical telemetry datapoints.
 */
export const organisations = pgTable("organisations", {
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

export const organisationUsers = pgTable("organisation_users", {
  id: text("id").primaryKey(),
  organisationId: text("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  identitySubject: text("identity_subject").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("viewer"),
  isPrimary: boolean("is_primary").notNull().default(false),
  status: text("status").notNull().default("active"),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_organisation_users_subject_org").on(table.identitySubject, table.organisationId),
  index("idx_organisation_users_org_status").on(table.organisationId, table.status),
]);

export const sites = pgTable("sites", {
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

export const devices = pgTable("devices", {
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
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_devices_openremote_asset").on(table.openremoteAssetId),
  uniqueIndex("idx_devices_site_external_id").on(table.siteId, table.externalId),
  index("idx_devices_site_status").on(table.siteId, table.connectionStatus),
]);

export const metricPoints = pgTable("metric_points", {
  id: text("id").primaryKey(),
  deviceId: text("device_id").notNull().references(() => devices.id, { onDelete: "cascade" }),
  openremoteAttribute: text("openremote_attribute").notNull(),
  name: text("name").notNull(),
  valueType: text("value_type").notNull().default("number"),
  unit: text("unit"),
  direction: text("direction").notNull().default("telemetry"),
  writable: boolean("writable").notNull().default(false),
  storeDatapoints: boolean("store_datapoints").notNull().default(true),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_metric_points_device_attribute").on(table.deviceId, table.openremoteAttribute),
  index("idx_metric_points_device_direction").on(table.deviceId, table.direction),
]);

export const configurationRevisions = pgTable("configuration_revisions", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  revision: integer("revision").notNull(),
  scope: text("scope").notNull(),
  payloadJson: jsonb("payload_json").notNull(),
  requestedBy: text("requested_by").notNull(),
  syncStatus: text("sync_status").notNull().default("draft"),
  validationMessage: text("validation_message"),
  openremoteEventId: text("openremote_event_id"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("idx_configuration_site_revision").on(table.siteId, table.revision),
  index("idx_configuration_site_status").on(table.siteId, table.syncStatus),
]);

export const alarmRules = pgTable("alarm_rules", {
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
  channelsJson: jsonb("channels_json").notNull().default(sql`'[]'::jsonb`),
  enabled: boolean("enabled").notNull().default(true),
  ...timestamps,
}, (table) => [
  index("idx_alarm_rules_site_enabled").on(table.siteId, table.enabled),
  index("idx_alarm_rules_metric").on(table.metricPointId),
]);

export const incidents = pgTable("incidents", {
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
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  acknowledgedBy: text("acknowledged_by"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedBy: text("resolved_by"),
  resolutionNote: text("resolution_note"),
}, (table) => [
  index("idx_incidents_site_state_opened").on(table.siteId, table.state, table.openedAt),
  index("idx_incidents_device_opened").on(table.deviceId, table.openedAt),
]);

export const notificationPreferences = pgTable("notification_preferences", {
  id: text("id").primaryKey(),
  organisationUserId: text("organisation_user_id").notNull().references(() => organisationUsers.id, { onDelete: "cascade" }),
  eventCode: text("event_code").notNull(),
  channel: text("channel").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  inherited: boolean("inherited").notNull().default(true),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_notification_user_event_channel").on(table.organisationUserId, table.eventCode, table.channel),
]);

export const tariffVersions = pgTable("tariff_versions", {
  id: text("id").primaryKey(),
  organisationId: text("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  siteId: text("site_id").references(() => sites.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  version: integer("version").notNull(),
  currency: text("currency").notNull().default("BGN"),
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to"),
  status: text("status").notNull().default("draft"),
  changeReason: text("change_reason"),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_tariff_org_name_version").on(table.organisationId, table.name, table.version),
  index("idx_tariff_org_status_valid_from").on(table.organisationId, table.status, table.validFrom),
]);

export const tariffComponents = pgTable("tariff_components", {
  id: text("id").primaryKey(),
  tariffVersionId: text("tariff_version_id").notNull().references(() => tariffVersions.id, { onDelete: "cascade" }),
  componentType: text("component_type").notNull(),
  price: numeric("price", { precision: 18, scale: 6 }).notNull(),
  unit: text("unit").notNull().default("BGN/MWh"),
  touWindow: text("tou_window"),
  daysJson: jsonb("days_json"),
  seasonFrom: date("season_from"),
  seasonTo: date("season_to"),
  ...timestamps,
}, (table) => [
  index("idx_tariff_components_version_type").on(table.tariffVersionId, table.componentType),
]);

export const integrationConnectors = pgTable("integration_connectors", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  connectorType: text("connector_type").notNull(),
  displayName: text("display_name").notNull(),
  status: text("status").notNull().default("available"),
  capabilitiesJson: jsonb("capabilities_json").notNull().default(sql`'[]'::jsonb`),
  configurationRef: text("configuration_ref"),
  lastHealthAt: timestamp("last_health_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_connectors_site_type").on(table.siteId, table.connectorType),
  index("idx_connectors_site_status").on(table.siteId, table.status),
]);

export const auditEvents = pgTable("audit_events", {
  id: text("id").primaryKey(),
  organisationId: text("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  siteId: text("site_id").references(() => sites.id, { onDelete: "set null" }),
  actorSubject: text("actor_subject").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id").notNull(),
  detailJson: jsonb("detail_json").notNull().default(sql`'{}'::jsonb`),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_audit_org_occurred").on(table.organisationId, table.occurredAt),
  index("idx_audit_resource").on(table.resourceType, table.resourceId, table.occurredAt),
]);
