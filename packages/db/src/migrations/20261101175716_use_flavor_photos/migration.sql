ALTER TABLE `products` ADD `use_flavor_photos` integer DEFAULT false NOT NULL;--> statement-breakpoint
-- Produk yang sudah punya varian rasa langsung memakai foto rasa.
UPDATE `products` SET `use_flavor_photos` = 1 WHERE `id` IN (SELECT `product_id` FROM `product_flavors`);
