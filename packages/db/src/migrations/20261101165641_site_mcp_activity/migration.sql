CREATE TABLE `activity_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`summary` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mcp_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`token_hash` text NOT NULL UNIQUE,
	`token_prefix` text NOT NULL,
	`scope` text DEFAULT 'read' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`last_used_at` text,
	`revoked_at` text
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY,
	`value` text NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
