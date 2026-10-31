CREATE TABLE `product_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`description` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`product_id` integer NOT NULL,
	`name` text NOT NULL,
	`price_cents` integer,
	`is_available` integer DEFAULT true NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_product_variants_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`category_id` integer NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`description` text,
	`price_cents` integer,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`image_url` text,
	`image_alt` text,
	`is_featured` integer DEFAULT false NOT NULL,
	`availability` text DEFAULT 'available' NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	CONSTRAINT `fk_products_category_id_product_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`)
);
