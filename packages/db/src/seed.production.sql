-- Authoritative public catalogue seed for a fresh D1 deployment.
-- Prices are rupiah x100: Rp 8.000 => 8000.
-- INSERT OR IGNORE keeps repeated Alchemy imports idempotent.

INSERT OR IGNORE INTO product_categories (slug, name, description, display_order, is_active)
VALUES
  ('mochi', 'Mochi', 'Mochi lembut dengan berbagai varian rasa', 1, 1),
  ('mango-sticky-rice', 'Mango Sticky Rice', 'Ketan manis dengan mangga segar', 2, 1),
  ('pancake-durian', 'Pancake Durian', 'Pancake lembut dengan isian durian', 3, 1),
  ('dubai-chewy-cookie', 'Dubai Chewy Cookie', 'Cookie chewy premium', 4, 1),
  ('slice-cake', 'Slice Cake', 'Kue lapis artisanal per slice', 5, 1),
  ('mille-crepes', 'Mille Crepes', 'Kue crepes berlapis-lapis per slice', 6, 1);

INSERT OR IGNORE INTO products
  (category_id, slug, name, description, price_cents, currency, is_featured, availability, display_order)
VALUES
  ((SELECT id FROM product_categories WHERE slug = 'mochi'),
   'artisanal-mochi-daifuku', 'Artisanal Mochi Daifuku',
   'Mochi lembut buatan tangan dengan isian krim pilihan. Tersedia dalam 8 varian rasa dan tiga ukuran porsi — 1 pcs, isi 4, dan isi 8. Varian rasa boleh dicampur sesuai selera.',
   8000, 'IDR', 1, 'available', 1),
  ((SELECT id FROM product_categories WHERE slug = 'mango-sticky-rice'),
   'authentic-mango-sticky-rice', 'Authentic Mango Sticky Rice',
   'Ketan manis yang dikukus dengan santan, disajikan bersama potongan mangga segar. Harga datar per porsi.',
   30000, 'IDR', 1, 'available', 2),
  ((SELECT id FROM product_categories WHERE slug = 'pancake-durian'),
   'pancake-durian-premium', 'Pancake Durian Premium',
   'Pancake lembut dengan isian durian pilihan. Dijual harga datar tunggal Rp 35.000 per porsi mika, tanpa paket isi 4 atau isi 8. Wajib disimpan di chiller.',
   35000, 'IDR', 1, 'available', 3),
  ((SELECT id FROM product_categories WHERE slug = 'dubai-chewy-cookie'),
   'dubai-chewy-cookie', 'Dubai Chewy Cookie',
   'Cookie chewy premium dengan tekstur kenyal dan cokelat yang melimpah.',
   30000, 'IDR', 1, 'available', 4),
  ((SELECT id FROM product_categories WHERE slug = 'slice-cake'),
   'slice-cake', 'Slice Cake',
   'Kue lapis artisanal dengan tekstur lembut dan krim yang seimbang. Dijual per slice dengan tiga pilihan varian rasa — Lotus Biscoff, Red Velvet, dan Coklat. Ketiga varian seharga.',
   16000, 'IDR', 1, 'available', 5),
  ((SELECT id FROM product_categories WHERE slug = 'mille-crepes'),
   'mille-crepes', 'Mille Crepes',
   'Kue crepes berlapis-lapis dengan krim lembut. Dijual per slice dengan tiga pilihan varian rasa — Lotus Biscoff, Red Velvet, dan Coklat. Ketiga varian seharga.',
   16000, 'IDR', 1, 'available', 6);

INSERT OR IGNORE INTO product_variants (product_id, name, price_cents, is_available, display_order)
SELECT id, '1 Pcs', 8000, 1, 1 FROM products WHERE slug = 'artisanal-mochi-daifuku';
INSERT OR IGNORE INTO product_variants (product_id, name, price_cents, is_available, display_order)
SELECT id, 'Isi 4 pcs', 30000, 1, 2 FROM products WHERE slug = 'artisanal-mochi-daifuku';
INSERT OR IGNORE INTO product_variants (product_id, name, price_cents, is_available, display_order)
SELECT id, 'Isi 8 pcs', 50000, 1, 3 FROM products WHERE slug = 'artisanal-mochi-daifuku';

INSERT OR IGNORE INTO product_variants (product_id, name, price_cents, is_available, display_order)
SELECT id, 'Lotus Biscoff', 16000, 1, 1 FROM products WHERE slug = 'slice-cake';
INSERT OR IGNORE INTO product_variants (product_id, name, price_cents, is_available, display_order)
SELECT id, 'Red Velvet', 16000, 1, 2 FROM products WHERE slug = 'slice-cake';
INSERT OR IGNORE INTO product_variants (product_id, name, price_cents, is_available, display_order)
SELECT id, 'Coklat', 16000, 1, 3 FROM products WHERE slug = 'slice-cake';

INSERT OR IGNORE INTO product_variants (product_id, name, price_cents, is_available, display_order)
SELECT id, 'Lotus Biscoff', 16000, 1, 1 FROM products WHERE slug = 'mille-crepes';
INSERT OR IGNORE INTO product_variants (product_id, name, price_cents, is_available, display_order)
SELECT id, 'Red Velvet', 16000, 1, 2 FROM products WHERE slug = 'mille-crepes';
INSERT OR IGNORE INTO product_variants (product_id, name, price_cents, is_available, display_order)
SELECT id, 'Coklat', 16000, 1, 3 FROM products WHERE slug = 'mille-crepes';
