CREATE TABLE `alarm_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`site_id` text,
	`metric_point_id` text,
	`name` text NOT NULL,
	`severity` text NOT NULL,
	`operator` text NOT NULL,
	`threshold_value` real,
	`duration_seconds` integer DEFAULT 0 NOT NULL,
	`cooldown_seconds` integer DEFAULT 1800 NOT NULL,
	`scope` text DEFAULT 'site' NOT NULL,
	`channels_json` text DEFAULT '[]' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`metric_point_id`) REFERENCES `metric_points`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_alarm_rules_site_enabled` ON `alarm_rules` (`site_id`,`enabled`);--> statement-breakpoint
CREATE INDEX `idx_alarm_rules_metric` ON `alarm_rules` (`metric_point_id`);--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`organisation_id` text NOT NULL,
	`site_id` text,
	`actor_subject` text NOT NULL,
	`action` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text NOT NULL,
	`detail_json` text DEFAULT '{}' NOT NULL,
	`occurred_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_audit_org_occurred` ON `audit_events` (`organisation_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_resource` ON `audit_events` (`resource_type`,`resource_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `configuration_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`site_id` text NOT NULL,
	`revision` integer NOT NULL,
	`scope` text NOT NULL,
	`payload_json` text NOT NULL,
	`requested_by` text NOT NULL,
	`sync_status` text DEFAULT 'draft' NOT NULL,
	`validation_message` text,
	`openremote_event_id` text,
	`requested_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`applied_at` text,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_configuration_site_revision` ON `configuration_revisions` (`site_id`,`revision`);--> statement-breakpoint
CREATE INDEX `idx_configuration_site_status` ON `configuration_revisions` (`site_id`,`sync_status`);--> statement-breakpoint
CREATE TABLE `devices` (
	`id` text PRIMARY KEY NOT NULL,
	`site_id` text NOT NULL,
	`openremote_asset_id` text NOT NULL,
	`external_id` text,
	`name` text NOT NULL,
	`asset_type` text NOT NULL,
	`manufacturer` text,
	`model` text,
	`protocol` text NOT NULL,
	`energy_direction` text DEFAULT 'bidirectional' NOT NULL,
	`connection_status` text DEFAULT 'unknown' NOT NULL,
	`last_seen_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_devices_openremote_asset` ON `devices` (`openremote_asset_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_devices_site_external_id` ON `devices` (`site_id`,`external_id`);--> statement-breakpoint
CREATE INDEX `idx_devices_site_status` ON `devices` (`site_id`,`connection_status`);--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` text PRIMARY KEY NOT NULL,
	`alarm_rule_id` text,
	`site_id` text NOT NULL,
	`device_id` text,
	`metric_point_id` text,
	`severity` text NOT NULL,
	`state` text DEFAULT 'open' NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`measured_value` real,
	`threshold_value` real,
	`opened_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`acknowledged_at` text,
	`acknowledged_by` text,
	`resolved_at` text,
	`resolved_by` text,
	`resolution_note` text,
	FOREIGN KEY (`alarm_rule_id`) REFERENCES `alarm_rules`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`metric_point_id`) REFERENCES `metric_points`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_incidents_site_state_opened` ON `incidents` (`site_id`,`state`,`opened_at`);--> statement-breakpoint
CREATE INDEX `idx_incidents_device_opened` ON `incidents` (`device_id`,`opened_at`);--> statement-breakpoint
CREATE TABLE `integration_connectors` (
	`id` text PRIMARY KEY NOT NULL,
	`site_id` text NOT NULL,
	`connector_type` text NOT NULL,
	`display_name` text NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`capabilities_json` text DEFAULT '[]' NOT NULL,
	`configuration_ref` text,
	`last_health_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_connectors_site_type` ON `integration_connectors` (`site_id`,`connector_type`);--> statement-breakpoint
CREATE INDEX `idx_connectors_site_status` ON `integration_connectors` (`site_id`,`status`);--> statement-breakpoint
CREATE TABLE `metric_points` (
	`id` text PRIMARY KEY NOT NULL,
	`device_id` text NOT NULL,
	`openremote_attribute` text NOT NULL,
	`name` text NOT NULL,
	`value_type` text DEFAULT 'number' NOT NULL,
	`unit` text,
	`direction` text DEFAULT 'telemetry' NOT NULL,
	`writable` integer DEFAULT false NOT NULL,
	`store_datapoints` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_metric_points_device_attribute` ON `metric_points` (`device_id`,`openremote_attribute`);--> statement-breakpoint
CREATE INDEX `idx_metric_points_device_direction` ON `metric_points` (`device_id`,`direction`);--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`organisation_user_id` text NOT NULL,
	`event_code` text NOT NULL,
	`channel` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`inherited` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organisation_user_id`) REFERENCES `organisation_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_notification_user_event_channel` ON `notification_preferences` (`organisation_user_id`,`event_code`,`channel`);--> statement-breakpoint
CREATE TABLE `organisation_users` (
	`id` text PRIMARY KEY NOT NULL,
	`organisation_id` text NOT NULL,
	`identity_subject` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_organisation_users_subject_org` ON `organisation_users` (`identity_subject`,`organisation_id`);--> statement-breakpoint
CREATE INDEX `idx_organisation_users_org_status` ON `organisation_users` (`organisation_id`,`status`);--> statement-breakpoint
CREATE TABLE `organisations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`legal_name` text,
	`registration_number` text,
	`type` text DEFAULT 'customer' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_organisations_registration_number` ON `organisations` (`registration_number`);--> statement-breakpoint
CREATE INDEX `idx_organisations_status_name` ON `organisations` (`status`,`name`);--> statement-breakpoint
CREATE TABLE `sites` (
	`id` text PRIMARY KEY NOT NULL,
	`organisation_id` text NOT NULL,
	`openremote_asset_id` text NOT NULL,
	`name` text NOT NULL,
	`country_code` text DEFAULT 'BG' NOT NULL,
	`timezone` text DEFAULT 'Europe/Sofia' NOT NULL,
	`market_code` text DEFAULT 'IBEX' NOT NULL,
	`latitude` real,
	`longitude` real,
	`status` text DEFAULT 'commissioning' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_sites_openremote_asset` ON `sites` (`openremote_asset_id`);--> statement-breakpoint
CREATE INDEX `idx_sites_org_status` ON `sites` (`organisation_id`,`status`);--> statement-breakpoint
CREATE TABLE `tariff_components` (
	`id` text PRIMARY KEY NOT NULL,
	`tariff_version_id` text NOT NULL,
	`component_type` text NOT NULL,
	`price` real NOT NULL,
	`unit` text DEFAULT 'BGN/MWh' NOT NULL,
	`tou_window` text,
	`days_json` text,
	`season_from` text,
	`season_to` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tariff_version_id`) REFERENCES `tariff_versions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_tariff_components_version_type` ON `tariff_components` (`tariff_version_id`,`component_type`);--> statement-breakpoint
CREATE TABLE `tariff_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`organisation_id` text NOT NULL,
	`site_id` text,
	`name` text NOT NULL,
	`version` integer NOT NULL,
	`currency` text DEFAULT 'BGN' NOT NULL,
	`valid_from` text NOT NULL,
	`valid_to` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`change_reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tariff_org_name_version` ON `tariff_versions` (`organisation_id`,`name`,`version`);--> statement-breakpoint
CREATE INDEX `idx_tariff_org_status_valid_from` ON `tariff_versions` (`organisation_id`,`status`,`valid_from`);